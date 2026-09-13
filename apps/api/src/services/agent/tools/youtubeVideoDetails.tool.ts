import { z } from 'zod';
import { AITool } from './tool.interface';
import { youtubeService } from '../../google/youtube.service';

export const youtubeVideoDetailsTool: AITool<{ videoIds: string[] }> = {
  name: 'youtubeVideoDetails',
  description: 'Retrieve detailed metrics, view count, like count, tags, and description for specific YouTube videos.',
  parameters: z.object({
    videoIds: z.array(z.string()).min(1).describe('List of YouTube video IDs to inspect.'),
  }),
  execute: async ({ videoIds }) => {
    try {
      const details = await youtubeService.getVideoDetails(videoIds);
      return {
        success: true,
        data: details,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to get YouTube video details.',
        code: 'YOUTUBE_ERROR',
      };
    }
  },
};
