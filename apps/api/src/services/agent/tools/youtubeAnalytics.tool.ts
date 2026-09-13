import { z } from 'zod';
import { AITool } from './tool.interface';
import { tokenStore } from '../../oauth/token-store';

export const youtubeAnalyticsTool: AITool<{ metric: string; startDate?: string; endDate?: string; dimensions?: string }> = {
  name: 'youtubeAnalytics',
  description: 'Retrieve YouTube Analytics data for the authorized channel (views, watch time, traffic sources, top videos, etc.)',
  parameters: z.object({
    metric: z.enum(['overview', 'topVideos', 'trafficSources', 'geography', 'subscriberChange']).describe('Type of analytics to retrieve.'),
    startDate: z.string().optional().default('30daysAgo').describe('Start date (YYYY-MM-DD or relative like "30daysAgo")'),
    endDate: z.string().optional().default('today').describe('End date (YYYY-MM-DD or "today")'),
    dimensions: z.string().optional().describe('Additional dimensions (optional).'),
  }),
  execute: async ({ metric, startDate = '30daysAgo', endDate = 'today' }) => {
    const token = tokenStore.get('youtube');
    if (!token) {
      return { success: false, error: 'YouTube is not connected. Click "Connect YouTube" to authorize.' };
    }

    const headers = { Authorization: `Bearer ${token.accessToken}` };

    try {
      // Get channel ID first
      const channelRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true',
        { headers }
      );
      if (!channelRes.ok) {
        if (channelRes.status === 401) return { success: false, error: 'YouTube token expired. Reconnect YouTube.' };
        throw new Error(`YouTube API error: ${channelRes.statusText}`);
      }
      const channelData: any = await channelRes.json();
      const channelId = channelData.items?.[0]?.id;
      if (!channelId) return { success: false, error: 'Could not retrieve your YouTube channel.' };

      let analyticsUrl = '';
      let metricsParam = '';
      let dimensionsParam = '';

      switch (metric) {
        case 'overview':
          metricsParam = 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained';
          break;
        case 'topVideos':
          metricsParam = 'views,estimatedMinutesWatched,averageViewDuration';
          dimensionsParam = 'video';
          break;
        case 'trafficSources':
          metricsParam = 'views,estimatedMinutesWatched';
          dimensionsParam = 'insightTrafficSourceType';
          break;
        case 'geography':
          metricsParam = 'views,estimatedMinutesWatched';
          dimensionsParam = 'country';
          break;
        case 'subscriberChange':
          metricsParam = 'subscribersGained,subscribersLost,netSubscribers';
          break;
      }

      const finalStartDate = startDate || '30daysAgo';
      const finalEndDate = endDate || 'today';

      const paramsData: Record<string, string> = {
        ids: `channel==${channelId}`,
        startDate: finalStartDate.includes('daysAgo')
          ? new Date(Date.now() - parseInt(finalStartDate) * 86400000).toISOString().slice(0, 10)
          : finalStartDate,
        endDate: finalEndDate === 'today' ? new Date().toISOString().slice(0, 10) : finalEndDate,
        metrics: metricsParam,
      };
      
      if (dimensionsParam) {
        paramsData.dimensions = dimensionsParam;
        paramsData.sort = '-views';
        paramsData.maxResults = '10';
      }

      const params = new URLSearchParams(paramsData);

      analyticsUrl = `https://youtubeanalytics.googleapis.com/v2/reports?${params}`;

      const analyticsRes = await fetch(analyticsUrl, { headers });
      if (!analyticsRes.ok) throw new Error(`YouTube Analytics error: ${analyticsRes.statusText}`);

      const analyticsData: any = await analyticsRes.json();
      return {
        success: true,
        data: {
          channelId,
          channelName: channelData.items?.[0]?.snippet?.title,
          metric,
          startDate,
          endDate,
          rows: analyticsData.rows,
          columnHeaders: analyticsData.columnHeaders,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
