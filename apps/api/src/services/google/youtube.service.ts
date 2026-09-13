import { getEnv } from '../../config/env';
import { tokenStore } from '../oauth/token-store';

export class YouTubeService {
  private getAuthHeader(): { Authorization: string } | null {
    const token = tokenStore.get('youtube') || tokenStore.get('google');
    if (token?.accessToken) {
      return { Authorization: `Bearer ${token.accessToken}` };
    }
    return null;
  }

  /**
   * Search videos on YouTube using OAuth or Public API Key.
   */
  async searchVideos(query: string, maxResults = 10) {
    const env = getEnv();
    const authHeader = this.getAuthHeader();

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('maxResults', String(maxResults));
    url.searchParams.set('type', 'video');

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader.Authorization;
    } else if (env.YOUTUBE_API_KEY) {
      url.searchParams.set('key', env.YOUTUBE_API_KEY);
    } else {
      throw new Error('YouTube Data API is not configured. Connect your Google account or set YOUTUBE_API_KEY in .env.');
    }

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`YouTube API error (${res.status}): ${text || res.statusText}`);
    }

    const data: any = await res.json();
    return (data.items || []).map((item: any) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
    }));
  }

  /**
   * Get detailed metrics and metadata for specific videos.
   */
  async getVideoDetails(videoIds: string[]) {
    const env = getEnv();
    const authHeader = this.getAuthHeader();

    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'snippet,statistics,contentDetails');
    url.searchParams.set('id', videoIds.join(','));

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader.Authorization;
    } else if (env.YOUTUBE_API_KEY) {
      url.searchParams.set('key', env.YOUTUBE_API_KEY);
    } else {
      throw new Error('YouTube Data API is not configured.');
    }

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`YouTube API error (${res.status}): ${text || res.statusText}`);
    }

    const data: any = await res.json();
    return (data.items || []).map((v: any) => ({
      id: v.id,
      title: v.snippet?.title,
      description: v.snippet?.description,
      tags: v.snippet?.tags || [],
      thumbnail: v.snippet?.thumbnails?.maxres?.url || v.snippet?.thumbnails?.high?.url,
      viewCount: Number(v.statistics?.viewCount || 0),
      likeCount: Number(v.statistics?.likeCount || 0),
      commentCount: Number(v.statistics?.commentCount || 0),
      duration: v.contentDetails?.duration,
      publishedAt: v.snippet?.publishedAt,
    }));
  }

  /**
   * Get authenticated user's channel overview.
   */
  async getChannelOverview() {
    const authHeader = this.getAuthHeader();
    if (!authHeader) {
      throw new Error('YouTube OAuth account not connected. Please connect your YouTube account in settings.');
    }

    const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&mine=true';
    const res = await fetch(url, { headers: authHeader });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`YouTube API error (${res.status}): ${text || res.statusText}`);
    }

    const data: any = await res.json();
    const channel = data.items?.[0];
    if (!channel) {
      throw new Error('No YouTube channel found for the authenticated Google account.');
    }

    return {
      id: channel.id,
      title: channel.snippet?.title,
      description: channel.snippet?.description,
      customUrl: channel.snippet?.customUrl,
      thumbnail: channel.snippet?.thumbnails?.high?.url,
      subscriberCount: Number(channel.statistics?.subscriberCount || 0),
      videoCount: Number(channel.statistics?.videoCount || 0),
      viewCount: Number(channel.statistics?.viewCount || 0),
    };
  }

  /**
   * Run YouTube Analytics reports via OAuth.
   */
  async getAnalyticsReport(options: {
    startDate: string;
    endDate: string;
    metrics?: string;
    dimensions?: string;
    filters?: string;
    sort?: string;
  }) {
    const authHeader = this.getAuthHeader();
    if (!authHeader) {
      throw new Error('YouTube Analytics requires an authorized Google connection. Please connect your account.');
    }

    const metrics =
      options.metrics ||
      'views,likes,comments,shares,subscribersGained,subscribersLost,estimatedMinutesWatched,averageViewDuration';

    const url = new URL('https://youtubeanalytics.googleapis.com/v2/reports');
    url.searchParams.set('ids', 'channel==MINE');
    url.searchParams.set('startDate', options.startDate);
    url.searchParams.set('endDate', options.endDate);
    url.searchParams.set('metrics', metrics);
    url.searchParams.set('dimensions', options.dimensions || 'day');
    url.searchParams.set('sort', options.sort || 'day');
    if (options.filters) url.searchParams.set('filters', options.filters);

    const res = await fetch(url.toString(), { headers: authHeader });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`YouTube Analytics error (${res.status}): ${text || res.statusText}`);
    }

    const data: any = await res.json();
    return {
      columnHeaders: data.columnHeaders || [],
      rows: data.rows || [],
    };
  }
}

export const youtubeService = new YouTubeService();
