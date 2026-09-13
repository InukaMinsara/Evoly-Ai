import { nvidiaClient, NvidiaError } from './nvidiaClient';
import { getEnv } from '../../../config/env';

export interface NvidiaImageGenerateOptions {
  prompt: string;
  model?: string;
  n?: number;
  seed?: number;
  width?: number;
  height?: number;
  responseFormat?: 'b64_json' | 'url';
}

export interface NormalizedImageResult {
  id: string;
  type: 'image';
  provider: string;
  model: string;
  mimeType: string;
  assetUrl: string;
  width?: number;
  height?: number;
  createdAt: string;
  prompt: string;
}

export class NvidiaImageService {
  /**
   * Generates an image using NVIDIA NIM.
   * Sends prompt and parameters using OpenAI-compatible or NIM-specific schema.
   */
  public async generate(options: NvidiaImageGenerateOptions): Promise<NormalizedImageResult> {
    const env = getEnv();
    const model = options.model || env.NVIDIA_IMAGE_MODEL || 'qwen-image';

    const payload: Record<string, unknown> = {
      model,
      prompt: options.prompt,
      n: options.n ?? 1,
      response_format: options.responseFormat || 'b64_json',
    };

    if (typeof options.seed === 'number') {
      payload['seed'] = options.seed;
    }
    if (typeof options.width === 'number') {
      payload['width'] = options.width;
    }
    if (typeof options.height === 'number') {
      payload['height'] = options.height;
    }

    const rawResponse = await nvidiaClient.request<any>('/images/generations', {
      method: 'POST',
      body: payload,
    });

    return this.normalizeResponse(rawResponse, options.prompt, model, options.width, options.height);
  }

  /**
   * Normalizes various NIM / OpenAI image response representations into standard EVOLY format.
   */
  public normalizeResponse(
    response: any,
    prompt: string,
    model: string,
    width?: number,
    height?: number,
  ): NormalizedImageResult {
    if (!response) {
      throw new NvidiaError({
        code: 'NVIDIA_EMPTY_RESPONSE',
        provider: 'nvidia',
        message: 'NVIDIA returned an empty response.',
        statusCode: 502,
        retryable: true,
      });
    }

    let assetUrl = '';
    let mimeType = 'image/png';

    // 1. OpenAI-compatible shape: { data: [ { b64_json?: string, url?: string } ] }
    if (Array.isArray(response.data) && response.data.length > 0) {
      const first = response.data[0];
      if (first.b64_json) {
        assetUrl = first.b64_json.startsWith('data:')
          ? first.b64_json
          : `data:image/png;base64,${first.b64_json}`;
      } else if (first.url) {
        assetUrl = first.url;
      }
    }
    // 2. NIM artifacts shape: { artifacts: [ { base64: string } ] }
    else if (Array.isArray(response.artifacts) && response.artifacts.length > 0) {
      const first = response.artifacts[0];
      if (first.base64) {
        assetUrl = first.base64.startsWith('data:')
          ? first.base64
          : `data:image/png;base64,${first.base64}`;
      }
    }
    // 3. Direct image field: { image: string }
    else if (response.image && typeof response.image === 'string') {
      assetUrl = response.image.startsWith('data:')
        ? response.image
        : `data:image/png;base64,${response.image}`;
    }

    if (!assetUrl) {
      throw new NvidiaError({
        code: 'NVIDIA_INVALID_RESPONSE',
        provider: 'nvidia',
        message: 'No image data could be extracted from NVIDIA NIM response.',
        statusCode: 502,
        retryable: true,
      });
    }

    if (assetUrl.startsWith('data:image/jpeg')) {
      mimeType = 'image/jpeg';
    } else if (assetUrl.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    }

    const uniqueId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return {
      id: uniqueId,
      type: 'image',
      provider: 'nvidia',
      model,
      mimeType,
      assetUrl,
      width,
      height,
      createdAt: new Date().toISOString(),
      prompt,
    };
  }
}

export const nvidiaImageService = new NvidiaImageService();
