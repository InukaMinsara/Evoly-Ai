import { VideoGenerationOptions, VideoResult } from '../capabilities/types';
import { kaggleVideoAdapter } from './kaggle.adapter';
import { nvidiaVideoAdapter } from './nvidia-video.adapter';

export class VideoService {
  async generate(options: VideoGenerationOptions): Promise<VideoResult> {
    if (options.provider === 'kaggle') {
      if (!kaggleVideoAdapter.isConfigured()) {
        throw new Error('Kaggle is not configured. Set a valid KAGGLE_USERNAME and KAGGLE_KEY in .env.');
      }
      return await kaggleVideoAdapter.generate(options);
    }

    if (options.provider === 'nvidia') {
      if (!nvidiaVideoAdapter.isConfigured()) {
        throw new Error('NVIDIA Video is not configured. Set NVIDIA_API_KEY and NVIDIA_VIDEO_MODEL in .env.');
      }
      return await nvidiaVideoAdapter.generate(options);
    }

    if (nvidiaVideoAdapter.isConfigured()) {
      return await nvidiaVideoAdapter.generate(options);
    }

    if (kaggleVideoAdapter.isConfigured()) {
      return await kaggleVideoAdapter.generate(options);
    }

    throw new Error(
      'No video generation provider is configured. Please configure Kaggle (KAGGLE_USERNAME, KAGGLE_KEY) or NVIDIA Video (NVIDIA_API_KEY, NVIDIA_VIDEO_MODEL).',
    );
  }
}

export const videoService = new VideoService();
