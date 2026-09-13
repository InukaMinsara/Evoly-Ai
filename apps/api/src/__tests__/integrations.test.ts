import { youtubeService } from '../services/google/youtube.service';
import { gitHubService } from '../services/github/github.service';
import { searchConsoleService } from '../services/google/search-console.service';
import { tokenStore } from '../services/oauth/token-store';

describe('External Provider Integrations', () => {
  beforeEach(() => {
    tokenStore.set('youtube', {
      provider: 'youtube',
      accessToken: 'mock_yt_token',
      scopes: [],
    });
    tokenStore.set('github', {
      provider: 'github',
      accessToken: 'mock_gh_token',
      scopes: [],
    });
    tokenStore.set('google_search_console', {
      provider: 'google_search_console',
      accessToken: 'mock_sc_token',
      scopes: [],
    });
  });

  it('searches YouTube videos with mock REST response', async () => {
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('youtube/v3/search')) {
        return {
          ok: true,
          json: async () => ({
            items: [
              {
                id: { videoId: 'vid123' },
                snippet: {
                  title: 'ESP32 Robotics Tutorial',
                  description: 'Learn robotics with ESP32',
                  channelTitle: 'RoboEngineering',
                  thumbnails: { high: { url: 'https://img.youtube.com/vi/vid123/hqdefault.jpg' } },
                },
              },
            ],
          }),
        } as any;
      }
      return { ok: false, statusText: 'Error' } as any;
    });

    try {
      const results = await youtubeService.searchVideos('esp32');
      expect(results.length).toBe(1);
      expect(results[0].videoId).toBe('vid123');
      expect(results[0].title).toBe('ESP32 Robotics Tutorial');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('lists GitHub repositories with mock API response', async () => {
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('api.github.com/user/repos')) {
        return {
          ok: true,
          json: async () => [
            {
              id: 1,
              name: 'esp32-quadruped',
              full_name: 'engineer/esp32-quadruped',
              private: false,
              description: 'Inverse kinematics quadruped robot',
            },
          ],
        } as any;
      }
      return { ok: false, statusText: 'Error' } as any;
    });

    try {
      const repos = await gitHubService.listRepositories(10);
      expect(repos.length).toBe(1);
      expect(repos[0].name).toBe('esp32-quadruped');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('queries Search Console performance with mock API response', async () => {
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('searchAnalytics/query')) {
        return {
          ok: true,
          json: async () => ({
            rows: [
              {
                keys: ['esp32 pinout diagram'],
                clicks: 142,
                impressions: 2100,
                ctr: 0.067,
                position: 2.4,
              },
            ],
          }),
        } as any;
      }
      return { ok: false, statusText: 'Error' } as any;
    });

    try {
      const report = await searchConsoleService.queryPerformance({
        siteUrl: 'https://evoly.ai',
        startDate: '2026-08-01',
        endDate: '2026-08-28',
      });

      expect(report.rows.length).toBe(1);
      expect(report.rows[0].keys).toContain('esp32 pinout diagram');
      expect(report.rows[0].clicks).toBe(142);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
