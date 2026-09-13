import { getEnv } from '../../config/env';
import { VideoGenerationOptions, VideoResult } from '../capabilities/types';

export class KaggleVideoAdapter {
  private baseUrl = 'https://www.kaggle.com/api/v1';

  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(env.KAGGLE_USERNAME && env.KAGGLE_KEY);
  }

  private getAuthHeader(): string {
    const env = getEnv();
    const token = Buffer.from(`${env.KAGGLE_USERNAME}:${env.KAGGLE_KEY}`).toString('base64');
    return `Basic ${token}`;
  }

  /**
   * Pushes a video generation job / notebook run to Kaggle.
   */
  async generate(options: VideoGenerationOptions): Promise<VideoResult> {
    if (!this.isConfigured()) {
      throw new Error('Kaggle is not configured. Set KAGGLE_USERNAME and KAGGLE_KEY in .env.');
    }

    const env = getEnv();
    const notebook = options.model || env.KAGGLE_VIDEO_NOTEBOOK || `${env.KAGGLE_USERNAME}/evoly-video-gen`;
    const jobId = `kg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Prepare kernel push payload
    const body = {
      id: notebook,
      title: `EVOLY Video Generation - ${jobId}`,
      text: `# EVOLY Video Generation Job\n# Prompt: ${options.prompt}\n# Duration: ${options.durationSeconds || 4}\n`,
      language: 'python',
      kernel_type: 'notebook',
      is_private: true,
      enable_gpu: true,
      enable_internet: true,
    };

    try {
      const res = await fetch(`${this.baseUrl}/kernels/push`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        if (res.status === 401 || res.status === 403) {
          throw new Error('Kaggle authentication failed. Generate a new Kaggle API token and update KAGGLE_USERNAME and KAGGLE_KEY.');
        }
        throw new Error(`Kaggle API error (${res.status}): ${text || res.statusText}`);
      }

      const data: any = await res.json().catch(() => ({}));

      return {
        id: jobId,
        provider: 'kaggle',
        model: notebook,
        status: 'queued',
        createdAt: new Date().toISOString(),
        metadata: {
          url: data.url,
          prompt: options.prompt,
          duration: options.durationSeconds,
        },
      };
    } catch (err: any) {
      throw new Error(`Kaggle job launch failed: ${err.message}`);
    }
  }

  /**
   * Checks the status of a running Kaggle kernel.
   */
  async getStatus(userName: string, kernelSlug: string): Promise<{
    status: 'queued' | 'running' | 'completed' | 'failed';
    message?: string;
  }> {
    if (!this.isConfigured()) {
      throw new Error('Kaggle is not configured.');
    }

    const res = await fetch(`${this.baseUrl}/kernels/status?userName=${encodeURIComponent(userName)}&kernelSlug=${encodeURIComponent(kernelSlug)}`, {
      headers: { Authorization: this.getAuthHeader() },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Kaggle status: ${res.statusText}`);
    }

    const data: any = await res.json();
    const statusStr = (data.status || '').toLowerCase();

    if (statusStr === 'complete') return { status: 'completed' };
    if (statusStr === 'error') return { status: 'failed', message: data.failureMessage };
    if (statusStr === 'running') return { status: 'running' };
    return { status: 'queued' };
  }

  /**
   * Retrieves output files from a completed Kaggle kernel.
   */
  async getOutput(userName: string, kernelSlug: string): Promise<{ files: Array<{ fileName: string; url: string }> }> {
    if (!this.isConfigured()) {
      throw new Error('Kaggle is not configured.');
    }

    const res = await fetch(`${this.baseUrl}/kernels/output?userName=${encodeURIComponent(userName)}&kernelSlug=${encodeURIComponent(kernelSlug)}`, {
      headers: { Authorization: this.getAuthHeader() },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Kaggle kernel output: ${res.statusText}`);
    }

    const data: any = await res.json();
    return {
      files: (data.files || []).map((f: any) => ({
        fileName: f.fileName,
        url: f.url,
      })),
    };
  }
}

export const kaggleVideoAdapter = new KaggleVideoAdapter();
