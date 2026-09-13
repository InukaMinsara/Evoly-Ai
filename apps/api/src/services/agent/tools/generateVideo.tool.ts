import { z } from 'zod';
import { AITool } from './tool.interface';
import { videoService } from '../../video/video.service';

export const generateVideoTool: AITool<{
  prompt: string;
  imageUrl?: string;
  durationSeconds?: number;
  model?: string;
}> = {
  name: 'generateVideo',
  description:
    'Generate robotics and engineering video simulations or concept animations using real configured video workflows (Kaggle authenticated execution or NVIDIA video models).',
  parameters: z.object({
    prompt: z.string().describe('Detailed prompt describing the robotic movement, action, or simulation.'),
    imageUrl: z.string().optional().describe('Optional source image URL or base64 to animate.'),
    durationSeconds: z.number().int().min(1).max(10).optional().default(4).describe('Duration in seconds (default 4).'),
    model: z.string().optional().describe('Optional specific video model or Kaggle notebook ID.'),
  }),
  execute: async ({ prompt, imageUrl, durationSeconds, model }) => {
    try {
      const result = await videoService.generate({
        prompt,
        imageUrl,
        durationSeconds,
        model,
      });

      return {
        success: true,
        data: result,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Video generation failed.',
        code: 'VIDEO_ERROR',
      };
    }
  },
};
