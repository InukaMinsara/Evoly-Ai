import { z } from 'zod';
import { AITool } from './tool.interface';
import { ImageGenerationOptions, ImageResult } from '../../capabilities/types';
import { nvidiaImageService } from '../../ai/nvidia/nvidiaImage.service';
import { pollinationsImageAdapter } from '../../capabilities/adapters/pollinations-image.adapter';
import { getEnv } from '../../../config/env';

export const generateImageTool: AITool<{
  prompt: string;
  model?: string;
  n?: number;
  seed?: number;
  width?: number;
  height?: number;
}> = {
  name: 'generateImage',
  description:
    'Generate engineering and robotics concept art, hardware component visualizations, realistic project illustrations, and thumbnails using NVIDIA NIM (default model: qwen-image). NOTE: Do NOT use this tool for editable circuit diagrams; circuit schematics use structured EDA/SVG.',
  parameters: z.object({
    prompt: z
      .string()
      .min(1, 'Prompt is required')
      .describe('Detailed engineering or visual prompt describing the image to generate.'),
    model: z
      .string()
      .optional()
      .describe('Optional NVIDIA model identifier (defaults to NVIDIA_IMAGE_MODEL in env, e.g. qwen-image).'),
    n: z.number().int().min(1).max(4).optional().default(1).describe('Number of images to generate (default 1).'),
    seed: z.number().int().optional().describe('Optional random seed for deterministic generation.'),
    width: z.number().int().optional().describe('Optional image width in pixels.'),
    height: z.number().int().optional().describe('Optional image height in pixels.'),
  }),
  execute: async ({ prompt, model, n, seed, width, height }) => {
    const env = getEnv();
    if (!env.NVIDIA_API_KEY) {
      return {
        success: false,
        code: 'NVIDIA_NOT_CONFIGURED',
        provider: 'nvidia',
        error: 'NVIDIA NIM is not configured. Set NVIDIA_API_KEY in .env',
        retryable: false,
      };
    }

    try {
      const options: ImageGenerationOptions = {
        prompt,
        model: model || env.NVIDIA_IMAGE_MODEL || 'qwen-image',
        n,
        seed,
        width,
        height,
      };

      let result: ImageResult;
      try {
        result = await nvidiaImageService.generate(options);
      } catch (nvidiaErr: any) {
        if (
          nvidiaErr.code === 'NVIDIA_AUTH_ERROR' ||
          nvidiaErr.code === 'NVIDIA_RATE_LIMITED' ||
          env.NODE_ENV === 'test'
        ) {
          throw nvidiaErr;
        }
        console.warn(`[ImageGen] NVIDIA NIM failed (${nvidiaErr.message}), falling back to Pollinations AI...`);
        result = await pollinationsImageAdapter.execute('IMAGE_GENERATION', options);
      }

      return {
        success: true,
        data: {
          id: result.id,
          prompt: result.prompt,
          imageUrl: result.assetUrl,
          markdown: `![${result.prompt}](${result.assetUrl})`,
          model: result.model,
          provider: result.provider,
          createdAt: result.createdAt,
          width: result.width,
          height: result.height,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        code: err.code || 'NVIDIA_ERROR',
        provider: 'nvidia',
        error: err.message || 'NVIDIA NIM image generation failed.',
        retryable: Boolean(err.retryable),
      };
    }
  },
};
