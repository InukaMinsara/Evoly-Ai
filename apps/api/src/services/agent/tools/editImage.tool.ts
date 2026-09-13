import { z } from 'zod';
import { AITool } from './tool.interface';
import { capabilityRouter } from '../../capabilities/provider-registry';
import { ImageEditOptions, ImageResult } from '../../capabilities/types';
import { getEnv } from '../../../config/env';

export const editImageTool: AITool<{
  prompt: string;
  image: string;
  model?: string;
  seed?: number;
}> = {
  name: 'editImage',
  description:
    'Edit or refine an existing engineering visual, robot render, or component image based on instructions using NVIDIA NIM (default model: qwen-image-edit-nvpcb-ovsl2sl).',
  parameters: z.object({
    prompt: z
      .string()
      .min(1, 'Prompt is required')
      .describe('Modification or editing instructions for the image.'),
    image: z
      .string()
      .min(1, 'Image reference is required')
      .describe('Source image URL or Base64 data string to edit.'),
    model: z
      .string()
      .optional()
      .describe(
        'Optional NVIDIA edit model identifier (defaults to NVIDIA_IMAGE_EDIT_MODEL in env, e.g. qwen-image-edit-nvpcb-ovsl2sl).',
      ),
    seed: z.number().int().optional().describe('Optional random seed for deterministic editing.'),
  }),
  execute: async ({ prompt, image, model, seed }) => {
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
      const options: ImageEditOptions = {
        prompt,
        image,
        model: model || env.NVIDIA_IMAGE_EDIT_MODEL || 'qwen-image-edit-nvpcb-ovsl2sl',
        seed,
      };

      const result = await capabilityRouter.execute<ImageEditOptions, ImageResult>(
        'IMAGE_EDITING',
        options,
      );

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
        },
      };
    } catch (err: any) {
      return {
        success: false,
        code: err.code || 'NVIDIA_ERROR',
        provider: 'nvidia',
        error: err.message || 'NVIDIA NIM image editing failed.',
        retryable: Boolean(err.retryable),
      };
    }
  },
};
