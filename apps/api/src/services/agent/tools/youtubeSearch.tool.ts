import { z } from 'zod';
import { AITool } from './tool.interface';
import { youtubeService } from '../../google/youtube.service';

export const youtubeSearchTool: AITool<{ query: string; maxResults?: number }> = {
  name: 'youtubeSearch',
  description: 'Search for YouTube videos, tutorials, and robotics hardware demonstrations.',
  parameters: z.object({
    query: z.string().describe('Search query for YouTube.'),
    maxResults: z.number().int().min(1).max(20).optional().default(5).describe('Max results to return.'),
  }),
  execute: async ({ query, maxResults }) => {
    try {
      const results = await youtubeService.searchVideos(query, maxResults);
      return {
        success: true,
        data: results,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'YouTube search failed.',
        code: 'YOUTUBE_ERROR',
      };
    }
  },
};
