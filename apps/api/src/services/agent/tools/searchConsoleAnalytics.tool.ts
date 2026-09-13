import { z } from 'zod';
import { AITool } from './tool.interface';
import { searchConsoleService } from '../../google/search-console.service';

export const searchConsoleAnalyticsTool: AITool<{
  siteUrl?: string;
  startDate?: string;
  endDate?: string;
  dimension?: 'query' | 'page' | 'country' | 'device';
}> = {
  name: 'searchConsoleAnalytics',
  description:
    'Query Google Search Console for organic search clicks, impressions, click-through rate (CTR), and average ranking position.',
  parameters: z.object({
    siteUrl: z.string().optional().describe('Site URL property (if omitted, will query the first verified site).'),
    startDate: z.string().optional().describe('Start date (YYYY-MM-DD), defaults to 28 days ago.'),
    endDate: z.string().optional().describe('End date (YYYY-MM-DD), defaults to today.'),
    dimension: z.enum(['query', 'page', 'country', 'device']).optional().default('query').describe('Aggregation dimension.'),
  }),
  execute: async ({ siteUrl, startDate, endDate, dimension }) => {
    try {
      let targetSite = siteUrl;
      if (!targetSite) {
        const sites = await searchConsoleService.listSites();
        if (sites.length === 0) {
          return {
            success: false,
            error: 'No verified sites found in Google Search Console.',
            code: 'NO_SITES',
          };
        }
        targetSite = sites[0].siteUrl;
      }

      const now = new Date();
      const end = endDate || (now.toISOString().split('T')[0] as string);
      const start =
        startDate || (new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string);

      const report = await searchConsoleService.queryPerformance({
        siteUrl: targetSite!,
        startDate: start,
        endDate: end,
        dimensions: [dimension || 'query'],
        rowLimit: 15,
      });

      return {
        success: true,
        data: {
          siteUrl: targetSite,
          startDate: start,
          endDate: end,
          results: report.rows,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Search Console query failed.',
        code: 'SEARCH_CONSOLE_ERROR',
      };
    }
  },
};
