import {
  CapabilityType,
  ProviderAdapter,
  ImageGenerationOptions,
  ImageEditOptions,
  ImageResult,
} from '../types';
import { nvidiaImageService } from '../../ai/nvidia/nvidiaImage.service';
import { nvidiaImageEditService } from '../../ai/nvidia/nvidiaImageEdit.service';
import { getEnv } from '../../../config/env';

export class NvidiaImageAdapter implements ProviderAdapter<ImageGenerationOptions | ImageEditOptions, ImageResult> {
  readonly id = 'nvidia';
  readonly name = 'NVIDIA NIM';
  readonly capabilities: CapabilityType[] = ['IMAGE_GENERATION', 'IMAGE_EDITING'];

  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(env.NVIDIA_API_KEY?.trim());
  }

  async execute(
    capability: CapabilityType,
    options: ImageGenerationOptions | ImageEditOptions,
  ): Promise<ImageResult> {
    if (capability === 'IMAGE_GENERATION') {
      return await nvidiaImageService.generate(options as ImageGenerationOptions);
    }

    if (capability === 'IMAGE_EDITING') {
      return await nvidiaImageEditService.edit(options as ImageEditOptions);
    }

    throw new Error(`Capability ${capability} is not supported by NVIDIA Image Adapter.`);
  }
}

export const nvidiaImageAdapter = new NvidiaImageAdapter();
