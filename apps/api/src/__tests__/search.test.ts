import { searchService } from '../services/search/search.service';

describe('SearchService', () => {
  it('normalizes search results from mock provider responses', async () => {
    // Mock global fetch for Tavily
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('tavily')) {
        return {
          ok: true,
          json: async () => ({
            results: [
              {
                title: 'ESP32 Pinout and Reference',
                url: 'https://docs.espressif.com/esp32',
                content: 'Complete pinout guide for ESP32 DevKit.',
                score: 0.98,
              },
            ],
          }),
        } as any;
      }
      return { ok: false, statusText: 'Not Found' } as any;
    });

    try {
      const { provider, results } = await searchService.search('esp32 pinout', 'tavily');
      expect(provider).toBe('tavily');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('ESP32 Pinout and Reference');
      expect(results[0].url).toBe('https://docs.espressif.com/esp32');
      expect(results[0].source).toBe('Tavily');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('performs multi-source research', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation(async () => {
      return {
        ok: true,
        json: async () => ({
          results: [
            {
              title: 'Robotic Arm Inverse Kinematics',
              url: 'https://example.com/kinematics',
              content: 'Kinematics analysis for multi-axis robotics.',
            },
          ],
        }),
      } as any;
    });

    try {
      const research = await searchService.research('inverse kinematics', 'standard');
      expect(research.sources.length).toBeGreaterThan(0);
      expect(research.queriesExecuted).toContain('inverse kinematics');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
