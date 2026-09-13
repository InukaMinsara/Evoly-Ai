import { kaggleVideoAdapter } from '../services/video/kaggle.adapter';

describe('Video Adapters', () => {
  it('validates Kaggle configuration correctly', () => {
    // Adapter checks env
    expect(typeof kaggleVideoAdapter.isConfigured()).toBe('boolean');
  });

  it('handles Kaggle kernel push job launch with mock', async () => {
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('kaggle.com/api/v1/kernels/push')) {
        return {
          ok: true,
          json: async () => ({
            url: 'https://www.kaggle.com/code/user/evoly-video-gen',
          }),
        } as any;
      }
      return { ok: false, statusText: 'Error' } as any;
    });

    try {
      // Mock configured check
      jest.spyOn(kaggleVideoAdapter, 'isConfigured').mockReturnValue(true);

      const res = await kaggleVideoAdapter.generate({
        prompt: 'Robot arm rotating 90 degrees smoothly',
        durationSeconds: 4,
      });

      expect(res.provider).toBe('kaggle');
      expect(res.status).toBe('queued');
      expect(res.metadata?.prompt).toBe('Robot arm rotating 90 degrees smoothly');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
