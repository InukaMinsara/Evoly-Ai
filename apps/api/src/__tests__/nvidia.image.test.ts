import { _resetEnvForTest } from '../config/env';
import { nvidiaClient } from '../services/ai/nvidia/nvidiaClient';
import { nvidiaImageService } from '../services/ai/nvidia/nvidiaImage.service';
import { nvidiaImageEditService } from '../services/ai/nvidia/nvidiaImageEdit.service';
import { generateImageTool } from '../services/agent/tools/generateImage.tool';
import { editImageTool } from '../services/agent/tools/editImage.tool';
import { globalToolRegistry } from '../services/agent/tools/tool-registry';

describe('NVIDIA NIM Image Generation & Editing Architecture', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    _resetEnvForTest();
    process.env = { ...originalEnv };
    delete process.env['NVIDIA_API_KEY'];
    delete process.env['NVIDIA_BASE_URL'];
    delete process.env['NVIDIA_IMAGE_MODEL'];
    delete process.env['NVIDIA_IMAGE_EDIT_MODEL'];
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    _resetEnvForTest();
  });

  describe('Configuration & Security', () => {
    it('should throw safe NvidiaError when NVIDIA_API_KEY is not configured', async () => {
      await expect(
        nvidiaImageService.generate({ prompt: 'autonomous rover' }),
      ).rejects.toThrow('NVIDIA API key is not configured');

      const toolResult = await generateImageTool.execute({ prompt: 'autonomous rover' });
      expect(toolResult.success).toBe(false);
      expect(toolResult.code).toBe('NVIDIA_NOT_CONFIGURED');
      expect(toolResult.error).toContain('NVIDIA NIM is not configured');
    });

    it('should test connection safely without throwing or exposing keys', async () => {
      const resultUnset = await nvidiaClient.testConnection();
      expect(resultUnset.configured).toBe(false);
      expect(resultUnset.authenticated).toBe(false);
      expect(resultUnset.provider).toBe('nvidia');

      process.env['NVIDIA_API_KEY'] = 'nvapi-mock-key';
      _resetEnvForTest();
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      } as any);

      const resultAuth = await nvidiaClient.testConnection();
      expect(resultAuth.configured).toBe(true);
      expect(resultAuth.authenticated).toBe(true);
    });

    it('should respect custom self-hosted NVIDIA_BASE_URL', () => {
      process.env['NVIDIA_BASE_URL'] = 'http://localhost:8000/v1/';
      _resetEnvForTest();
      expect(nvidiaClient.getBaseUrl()).toBe('http://localhost:8000/v1');
    });
  });

  describe('generateImage Tool & Service Normalization', () => {
    it('should normalize OpenAI-compatible b64_json image responses', async () => {
      process.env['NVIDIA_API_KEY'] = 'nvapi-mock-key';
      process.env['NVIDIA_IMAGE_MODEL'] = 'qwen-image';

      const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({
          created: 1720000000,
          data: [
            {
              b64_json: mockBase64,
            },
          ],
        }),
      } as any);

      const result = await nvidiaImageService.generate({
        prompt: 'futuristic robotics arm render',
        width: 1024,
        height: 1024,
      });

      expect(result.type).toBe('image');
      expect(result.provider).toBe('nvidia');
      expect(result.model).toBe('qwen-image');
      expect(result.prompt).toBe('futuristic robotics arm render');
      expect(result.assetUrl).toBe(`data:image/png;base64,${mockBase64}`);

      const toolResult = await generateImageTool.execute({
        prompt: 'futuristic robotics arm render',
      });
      expect(toolResult.success).toBe(true);
      expect(toolResult.data?.markdown).toContain(`![futuristic robotics arm render]`);
    });

    it('should normalize direct URL image responses', async () => {
      process.env['NVIDIA_API_KEY'] = 'nvapi-mock-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: [{ url: 'https://cdn.nvidia.com/sample-robot.png' }],
        }),
      } as any);

      const result = await nvidiaImageService.generate({
        prompt: 'mobile robot chassis',
      });

      expect(result.assetUrl).toBe('https://cdn.nvidia.com/sample-robot.png');
    });

    it('should handle malformed or empty provider responses', async () => {
      process.env['NVIDIA_API_KEY'] = 'nvapi-mock-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ data: [] }),
      } as any);

      await expect(
        nvidiaImageService.generate({ prompt: 'test' }),
      ).rejects.toThrow('No image data could be extracted');
    });
  });

  describe('Error Classification', () => {
    it('should map 401 to NVIDIA_AUTH_ERROR', async () => {
      process.env['NVIDIA_API_KEY'] = 'nvapi-invalid-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Invalid API Key' }),
      } as any);

      const toolResult = await generateImageTool.execute({ prompt: 'robot' });
      expect(toolResult.success).toBe(false);
      expect(toolResult.code).toBe('NVIDIA_AUTH_ERROR');
      expect(toolResult.error).toContain('authentication failed');
    });

    it('should map 429 to NVIDIA_RATE_LIMITED with retryable=true', async () => {
      process.env['NVIDIA_API_KEY'] = 'nvapi-valid-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Too many requests' }),
      } as any);

      const toolResult = await generateImageTool.execute({ prompt: 'robot' });
      expect(toolResult.success).toBe(false);
      expect(toolResult.code).toBe('NVIDIA_RATE_LIMITED');
      expect(toolResult.retryable).toBe(true);
    });
  });

  describe('editImage Tool & Service', () => {
    it('should execute image editing and return normalized result', async () => {
      process.env['NVIDIA_API_KEY'] = 'nvapi-mock-key';
      process.env['NVIDIA_IMAGE_EDIT_MODEL'] = 'qwen-image-edit-nvpcb-ovsl2sl';

      const mockBase64 = 'edited-base64-image-data';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: [{ b64_json: mockBase64 }],
        }),
      } as any);

      const result = await nvidiaImageEditService.edit({
        prompt: 'Add solar panels to the rover',
        image: 'data:image/png;base64,original-base64',
      });

      expect(result.model).toBe('qwen-image-edit-nvpcb-ovsl2sl');
      expect(result.assetUrl).toBe(`data:image/png;base64,${mockBase64}`);

      const toolResult = await editImageTool.execute({
        prompt: 'Add solar panels to the rover',
        image: 'data:image/png;base64,original-base64',
      });

      expect(toolResult.success).toBe(true);
      expect(toolResult.data?.prompt).toBe('Add solar panels to the rover');
    });
  });

  describe('Tool Registry', () => {
    it('should have generateImage, editImage, and imageGeneration registered', () => {
      expect(globalToolRegistry.getTool('generateImage')).toBeDefined();
      expect(globalToolRegistry.getTool('editImage')).toBeDefined();
      expect(globalToolRegistry.getTool('imageGeneration')).toBeDefined();
    });
  });
});
