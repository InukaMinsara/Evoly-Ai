import { nvidiaClient } from './nvidiaClient';
import { nvidiaImageService, NormalizedImageResult } from './nvidiaImage.service';
import { getEnv } from '../../../config/env';

export interface NvidiaImageEditOptions {
  prompt: string;
  image: string; // Base64 data URL or external asset URL
  model?: string;
  seed?: number;
}

export class NvidiaImageEditService {
  /**
   * Edits an existing image based on an engineering prompt and source visual.
   * Uses NVIDIA_IMAGE_EDIT_MODEL (default: qwen-image-edit-nvpcb-ovsl2sl).
   */
  public async edit(options: NvidiaImageEditOptions): Promise<NormalizedImageResult> {
    const env = getEnv();
    const model = options.model || env.NVIDIA_IMAGE_EDIT_MODEL || 'qwen-image-edit-nvpcb-ovsl2sl';

    // Strip data URL prefix if raw base64 is required by endpoint, or send as structured input
    let cleanImage = options.image;
    if (cleanImage.startsWith('data:')) {
      const parts = cleanImage.split(',');
      if (parts.length > 1 && parts[1]) {
        cleanImage = parts[1];
      }
    }

    const payload: Record<string, unknown> = {
      model,
      prompt: options.prompt,
      image: cleanImage,
      response_format: 'b64_json',
    };

    if (typeof options.seed === 'number') {
      payload['seed'] = options.seed;
    }

    const rawResponse = await nvidiaClient.request<any>('/images/edits', {
      method: 'POST',
      body: payload,
    });

    return nvidiaImageService.normalizeResponse(rawResponse, options.prompt, model);
  }
}

export const nvidiaImageEditService = new NvidiaImageEditService();
