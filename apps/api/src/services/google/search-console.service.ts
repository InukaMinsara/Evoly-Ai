import { tokenStore } from '../oauth/token-store';

export class SearchConsoleService {
  private getAuthHeader(): { Authorization: string } | null {
    const token = tokenStore.get('google_search_console') || tokenStore.get('google');
    if (token?.accessToken) {
      return { Authorization: `Bearer ${token.accessToken}` };
    }
    return null;
  }

  /**
   * List all verified sites in the user's Search Console account.
   */
  async listSites() {
    const authHeader = this.getAuthHeader();
    if (!authHeader) {
      throw new Error('Google Search Console is not connected. Please connect your Google account in Settings.');
    }

    const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: authHeader,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Search Console API error (${res.status}): ${text || res.statusText}`);
    }

    const data: any = await res.json();
    return (data.siteEntry || []).map((s: any) => ({
      siteUrl: s.siteUrl,
      permissionLevel: s.permissionLevel,
    }));
  }

  /**
   * Query search performance analytics (clicks, impressions, CTR, average position).
   */
  async queryPerformance(options: {
    siteUrl: string;
    startDate: string;
    endDate: string;
    dimensions?: Array<'query' | 'page' | 'country' | 'device' | 'date'>;
    rowLimit?: number;
  }) {
    const authHeader = this.getAuthHeader();
    if (!authHeader) {
      throw new Error('Google Search Console is not connected. Please connect your Google account in Settings.');
    }

    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(options.siteUrl)}/searchAnalytics/query`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: options.startDate,
        endDate: options.endDate,
        dimensions: options.dimensions || ['query'],
        rowLimit: options.rowLimit || 25,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Search Console API error (${res.status}): ${text || res.statusText}`);
    }

    const data: any = await res.json();
    return {
      rows: (data.rows || []).map((r: any) => ({
        keys: r.keys,
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: r.ctr || 0,
        position: r.position || 0,
      })),
    };
  }
}

export const searchConsoleService = new SearchConsoleService();
