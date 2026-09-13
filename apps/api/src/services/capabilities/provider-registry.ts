import { CapabilityType, ProviderAdapter } from './types';
import { nvidiaImageAdapter } from './adapters/nvidia-image.adapter';
import { pollinationsImageAdapter } from './adapters/pollinations-image.adapter';

export class CapabilityRouter {
  private adapters: Map<CapabilityType, ProviderAdapter<any, any>[]> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.register(nvidiaImageAdapter);
    this.register(pollinationsImageAdapter);
  }

  public register(adapter: ProviderAdapter<any, any>): void {
    for (const cap of adapter.capabilities) {
      const list = this.adapters.get(cap) || [];
      list.push(adapter);
      this.adapters.set(cap, list);
    }
  }

  /**
   * Retrieves all configured provider adapters for a capability.
   */
  public getConfiguredAdapters<TOpt = any, TRes = any>(capability: CapabilityType): ProviderAdapter<TOpt, TRes>[] {
    const list = this.adapters.get(capability) || [];
    return list.filter((a) => a.isConfigured()) as ProviderAdapter<TOpt, TRes>[];
  }

  /**
   * Retrieves the active configured provider adapter for a capability.
   */
  public getAdapter<TOpt = any, TRes = any>(capability: CapabilityType): ProviderAdapter<TOpt, TRes> {
    const configured = this.getConfiguredAdapters<TOpt, TRes>(capability);

    if (configured.length === 0) {
      const available = (this.adapters.get(capability) || []).map((a) => a.name).join(', ') || 'None';
      throw new Error(
        `No configured provider found for capability "${capability}". Available registered providers: ${available}.`,
      );
    }

    return configured[0]!;
  }

  /**
   * Executes a capability using the active provider adapters with automatic fallback.
   */
  public async execute<TOpt = any, TRes = any>(capability: CapabilityType, options: TOpt): Promise<TRes> {
    const configured = this.getConfiguredAdapters<TOpt, TRes>(capability);

    if (configured.length === 0) {
      throw new Error(`No configured provider found for capability "${capability}".`);
    }

    let lastError: any = null;
    for (const adapter of configured) {
      try {
        return await adapter.execute(capability, options);
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[CapabilityRouter] Provider "${adapter.name}" failed for "${capability}": ${err?.message || err}. Attempting fallback...`,
        );
      }
    }

    throw lastError || new Error(`All providers for capability "${capability}" failed.`);
  }
}

export const capabilityRouter = new CapabilityRouter();
