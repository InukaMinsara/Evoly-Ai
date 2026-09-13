import { z } from 'zod';
import { AITool } from './tool.interface';
import { searchService } from '../../search/search.service';

export const webResearchTool: AITool<{ topic: string; depth?: 'standard' | 'deep' }> = {
  name: 'webResearch',
  description:
    'Perform in-depth research on technical robotics topics, engineering standards, hardware components, or algorithms across verified scientific and documentation sources.',
  parameters: z.object({
    topic: z.string().describe('The topic or question to research deeply.'),
    depth: z.enum(['standard', 'deep']).optional().default('standard').describe('Research depth: standard (4 sources) or deep (8 sources).'),
  }),
  execute: async ({ topic, depth }) => {
    try {
      const research = await searchService.research(topic, depth);
      return {
        success: true,
        data: research,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Deep research failed.',
        code: 'RESEARCH_ERROR',
      };
    }
  },
};
