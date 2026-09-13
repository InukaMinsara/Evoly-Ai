import { z } from 'zod';
import { AITool } from './tool.interface';
import { searchService } from '../../search/search.service';

export const webSearchTool: AITool<{ query: string; provider?: string }> = {
  name: 'webSearch',
  description:
    'Search the web for current technical information, component datasheets, pinouts, robotics documentation, and news using configured search providers (Google, Tavily, Exa, Serper, Jina, etc.).',
  parameters: z.object({
    query: z.string().describe('The search query to execute.'),
    provider: z.string().optional().describe('Optional specific provider: google, tavily, exa, serper, jina, firecrawl, bing, you.'),
  }),
  execute: async ({ query, provider }) => {
    try {
      const { provider: usedProvider, results } = await searchService.search(query, provider, 5);
      return {
        success: true,
        provider: usedProvider,
        data: results,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Web search failed.',
        code: 'SEARCH_ERROR',
      };
    }
  },
};
