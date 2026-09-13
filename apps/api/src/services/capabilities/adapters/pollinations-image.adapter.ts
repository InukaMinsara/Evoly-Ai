import {
  CapabilityType,
  ProviderAdapter,
  ImageGenerationOptions,
  ImageResult,
} from '../types';
import { getEnv } from '../../../config/env';

export class PollinationsImageAdapter implements ProviderAdapter<ImageGenerationOptions, ImageResult> {
  readonly id = 'pollinations';
  readonly name = 'Pollinations AI';
  readonly capabilities: CapabilityType[] = ['IMAGE_GENERATION'];

  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(env.POLLINATIONS_AI_API_KEY?.trim() || true);
  }

  async execute(
    capability: CapabilityType,
    options: ImageGenerationOptions,
  ): Promise<ImageResult> {
    if (capability !== 'IMAGE_GENERATION') {
      throw new Error(`Capability ${capability} is not supported by Pollinations Image Adapter.`);
    }

    const env = getEnv();
    const width = options.width || 1024;
    const height = options.height || 1024;
    const seedParam = typeof options.seed === 'number' ? `&seed=${options.seed}` : '';
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(options.prompt)}?width=${width}&height=${height}&nologo=true${seedParam}`;

    const headers: Record<string, string> = {};
    if (env.POLLINATIONS_AI_API_KEY?.trim()) {
      headers['Authorization'] = `Bearer ${env.POLLINATIONS_AI_API_KEY.trim()}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Pollinations AI image generation failed with status ${res.status}`);
    }

    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    const assetUrl = url;
    const id = `img_poll_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    return {
      id,
      type: 'image',
      provider: 'pollinations',
      model: options.model || 'pollinations-flux',
      mimeType,
      assetUrl,
      width,
      height,
      createdAt: new Date().toISOString(),
      prompt: options.prompt,
    };
  }
}

export const pollinationsImageAdapter = new PollinationsImageAdapter();
