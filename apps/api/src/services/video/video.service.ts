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
      if (nvidiaVideoAdapter.isConfigured()) {
        try {
          return await nvidiaVideoAdapter.generate(options);
        } catch (nvidiaErr: any) {
          console.warn('[VideoService] NVIDIA Video failed, falling back to Kaggle:', nvidiaErr.message);
        }
      }
      // Fall back seamlessly to Kaggle Cloud GPU
      if (kaggleVideoAdapter.isConfigured()) {
        return await kaggleVideoAdapter.generate(options);
      }
      throw new Error('NVIDIA Video is not configured. Set NVIDIA_API_KEY and NVIDIA_VIDEO_MODEL in .env.');
    }

    if (kaggleVideoAdapter.isConfigured()) {
      return await kaggleVideoAdapter.generate(options);
    }

    if (nvidiaVideoAdapter.isConfigured()) {
      return await nvidiaVideoAdapter.generate(options);
    }

    throw new Error(
      'No video generation provider is configured. Please configure Kaggle (KAGGLE_USERNAME, KAGGLE_KEY) or NVIDIA Video.',
    );
  }
}

export const videoService = new VideoService();
