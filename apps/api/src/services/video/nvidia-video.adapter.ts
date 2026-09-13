import { getEnv } from '../../config/env';
import { VideoGenerationOptions, VideoResult } from '../capabilities/types';
import { nvidiaClient } from '../ai/nvidia/nvidiaClient';

export class NvidiaVideoAdapter {
  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(env.NVIDIA_API_KEY && env.NVIDIA_VIDEO_MODEL);
  }

  async generate(options: VideoGenerationOptions): Promise<VideoResult> {
    const env = getEnv();
    if (!this.isConfigured()) {
      throw new Error('NVIDIA Video is not configured. Set NVIDIA_API_KEY and NVIDIA_VIDEO_MODEL in .env.');
    }

    const model = options.model || env.NVIDIA_VIDEO_MODEL;
    const payload = {
      model,
      prompt: options.prompt,
      image: options.imageUrl,
      duration: options.durationSeconds || 4,
    };

    const res: any = await nvidiaClient.request('/video/generations', {
      method: 'POST',
      body: payload,
    });

    const videoUrl = res.video_url || res.data?.[0]?.url || res.artifacts?.[0]?.base64;

    return {
      id: `nv_vid_${Date.now()}`,
      provider: 'nvidia',
      model: model!,
      videoUrl,
      status: videoUrl ? 'completed' : 'running',
      createdAt: new Date().toISOString(),
    };
  }
}

export const nvidiaVideoAdapter = new NvidiaVideoAdapter();
