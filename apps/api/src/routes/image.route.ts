import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { nvidiaClient, NvidiaError } from '../services/ai/nvidia/nvidiaClient';
import { nvidiaImageEditService } from '../services/ai/nvidia/nvidiaImageEdit.service';
import { capabilityRouter } from '../services/capabilities/provider-registry';
import { getEnv } from '../config/env';

const generateSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  model: z.string().optional(),
  n: z.number().int().min(1).max(4).optional().default(1),
  seed: z.number().int().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
});

const editSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  image: z.string().min(1, 'Image cannot be empty'),
  model: z.string().optional(),
  seed: z.number().int().optional(),
});

export async function imageRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/ai/image/test
   * Tests real NVIDIA NIM connectivity and authentication.
   * Never leaks or exposes secret credentials.
   */
  fastify.post('/ai/image/test', async (_request, reply) => {
    const env = getEnv();
    const result = await nvidiaClient.testConnection();

    return reply.status(result.authenticated ? 200 : result.configured ? 401 : 503).send({
      configured: result.configured,
      authenticated: result.authenticated,
      provider: 'nvidia',
      baseUrl: result.baseUrl,
      model: env.NVIDIA_IMAGE_MODEL || 'qwen-image',
      error: result.error,
    });
  });

  /**
   * GET /api/ai/image/debug
   * Safe diagnostic output without exposing private keys.
   */
  fastify.get('/ai/image/debug', async (_request, reply) => {
    const env = getEnv();
    const keyPresent = Boolean(env.NVIDIA_API_KEY?.trim());
    const testResult = await nvidiaClient.testConnection();

    return reply.send({
      provider: 'nvidia',
      configured: keyPresent ? 'YES' : 'NO',
      keyPresent: keyPresent ? 'YES' : 'NO',
      providerReachable: testResult.error?.includes('Could not connect') ? 'NO' : 'YES',
      authentication: testResult.authenticated ? 'PASS' : keyPresent ? 'FAIL' : 'NOT_CONFIGURED',
      model: env.NVIDIA_IMAGE_MODEL || 'qwen-image',
      editModel: env.NVIDIA_IMAGE_EDIT_MODEL || 'qwen-image-edit-nvpcb-ovsl2sl',
      baseUrl: nvidiaClient.getBaseUrl(),
      note: testResult.error,
    });
  });

  /**
   * POST /api/ai/image/generate
   * Direct image generation endpoint powered by NVIDIA NIM.
   */
  fastify.post('/ai/image/generate', async (request, reply) => {
    const parsed = generateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        provider: 'nvidia',
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
    }

    try {
      const result = await capabilityRouter.execute<any, any>('IMAGE_GENERATION', parsed.data);
      return reply.send({
        success: true,
        data: result,
        imageUrl: result.assetUrl,
        assetUrl: result.assetUrl,
      });
    } catch (err: any) {
      const statusCode = err instanceof NvidiaError ? err.statusCode : 500;
      return reply.status(statusCode).send({
        code: err.code || 'IMAGE_ERROR',
        provider: err.provider || 'image-router',
        message: err.message || 'Image generation failed',
        retryable: Boolean(err.retryable),
      });
    }
  });

  /**
   * POST /api/media/image/generate (alias for Media Studio)
   */
  fastify.post('/media/image/generate', async (request, reply) => {
    const parsed = generateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        provider: 'image-router',
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
    }

    try {
      const result = await capabilityRouter.execute<any, any>('IMAGE_GENERATION', parsed.data);
      return reply.send({
        success: true,
        data: result,
        imageUrl: result.assetUrl,
        assetUrl: result.assetUrl,
      });
    } catch (err: any) {
      return reply.status(500).send({
        code: err.code || 'IMAGE_ERROR',
        provider: err.provider || 'image-router',
        message: err.message || 'Image generation failed',
      });
    }
  });

  /**
   * POST /api/images/generate
   * Direct image generation alias compatible with YouTube Studio & other clients
   */
  fastify.post('/images/generate', async (request, reply) => {
    const parsed = generateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        provider: 'image-router',
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
    }

    try {
      const result = await capabilityRouter.execute<any, any>('IMAGE_GENERATION', parsed.data);
      return reply.send({
        success: true,
        data: result,
        imageUrl: result.assetUrl,
        assetUrl: result.assetUrl,
      });
    } catch (err: any) {
      const statusCode = err instanceof NvidiaError ? err.statusCode : 500;
      return reply.status(statusCode).send({
        code: err.code || 'IMAGE_ERROR',
        provider: err.provider || 'image-router',
        message: err.message || 'Image generation failed',
        retryable: Boolean(err.retryable),
      });
    }
  });

  /**
   * POST /api/ai/image/edit
   * Direct image edit endpoint powered by NVIDIA NIM.
   */
  fastify.post('/ai/image/edit', async (request, reply) => {
    const parsed = editSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        provider: 'nvidia',
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
    }

    try {
      const result = await nvidiaImageEditService.edit(parsed.data);
      return reply.send({
        success: true,
        data: result,
      });
    } catch (err: any) {
      const statusCode = err instanceof NvidiaError ? err.statusCode : 500;
      return reply.status(statusCode).send({
        code: err.code || 'NVIDIA_ERROR',
        provider: 'nvidia',
        message: err.message || 'Image editing failed',
        retryable: Boolean(err.retryable),
      });
    }
  });
}
