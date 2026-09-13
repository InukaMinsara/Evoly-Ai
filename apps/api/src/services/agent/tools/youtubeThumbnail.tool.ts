import { z } from 'zod';
import { AITool } from './tool.interface';
import { capabilityRouter } from '../../capabilities/provider-registry';
import { ImageGenerationOptions, ImageResult } from '../../capabilities/types';

export const youtubeThumbnailTool: AITool<{
  videoTitle: string;
  theme: string;
  elements?: string;
}> = {
  name: 'youtubeThumbnail',
  description:
    'Generate a high-CTR YouTube thumbnail illustration using NVIDIA NIM with 16:9 aspect ratio and engineering composition.',
  parameters: z.object({
    videoTitle: z.string().describe('Title of the YouTube video.'),
    theme: z.string().describe('Visual theme, robotics hardware focus, or style.'),
    elements: z.string().optional().describe('Key elements (e.g. glowing circuit, robotic arm, bold text placeholder).'),
  }),
  execute: async ({ videoTitle, theme, elements }) => {
    const prompt = `Professional YouTube video thumbnail, 16:9 widescreen, high contrast, vibrant lighting. Topic: "${videoTitle}". Theme: ${theme}. Visual elements: ${elements || 'robotics hardware, circuit board, modern lab background'}. Cinematic 8k digital render.`;

    try {
      const result = await capabilityRouter.execute<ImageGenerationOptions, ImageResult>(
        'IMAGE_GENERATION',
        {
          prompt,
          width: 1280,
          height: 720,
        },
      );

      return {
        success: true,
        data: {
          id: result.id,
          thumbnailUrl: result.assetUrl,
          markdown: `![YouTube Thumbnail: ${videoTitle}](${result.assetUrl})`,
          prompt,
          dimensions: '1280x720 (16:9)',
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'YouTube thumbnail generation failed.',
        code: 'THUMBNAIL_ERROR',
      };
    }
  },
};
