import { getEnv } from '../../../config/env';

export interface NvidiaErrorResponse {
  code: string;
  provider: 'nvidia';
  message: string;
  statusCode: number;
  retryable: boolean;
}

export class NvidiaError extends Error {
  public readonly code: string;
  public readonly provider = 'nvidia' as const;
  public readonly statusCode: number;
  public readonly retryable: boolean;

  constructor(details: NvidiaErrorResponse) {
    super(details.message);
    this.name = 'NvidiaError';
    this.code = details.code;
    this.statusCode = details.statusCode;
    this.retryable = details.retryable;
  }
}

export class NvidiaClient {
  private static readonly DEFAULT_HOSTED_BASE_URL = 'https://ai.api.nvidia.com/v1';

  /**
   * Resolves the configured NVIDIA base URL.
   * Supports both hosted NVIDIA NIM cloud and self-hosted local NIM instances.
   */
  public getBaseUrl(): string {
    const env = getEnv();
    const customUrl = env.NVIDIA_BASE_URL?.trim();
    if (customUrl) {
      return customUrl.replace(/\/+$/, '');
    }
    return NvidiaClient.DEFAULT_HOSTED_BASE_URL;
  }

  /**
   * Retrieves the server-side API key.
   * Never exposed to frontend or logged.
   */
  private getApiKey(): string {
    const env = getEnv();
    const key = env.NVIDIA_API_KEY?.trim();
    if (!key) {
      throw new NvidiaError({
        code: 'NVIDIA_NOT_CONFIGURED',
        provider: 'nvidia',
        message: 'NVIDIA API key is not configured. Set NVIDIA_API_KEY in .env',
        statusCode: 503,
        retryable: false,
      });
    }
    return key;
  }

  /**
   * Executes an authenticated HTTP request to the NVIDIA NIM API.
   * Sanitizes all logs and handles provider error classification.
   */
  public async request<T = unknown>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST';
      body?: unknown;
      headers?: Record<string, string>;
      timeoutMs?: number;
    } = {},
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;
    const apiKey = this.getApiKey();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const method = options.method || (options.body ? 'POST' : 'GET');
    const timeoutMs = options.timeoutMs || 45000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const duration = Date.now() - startTime;
      console.log(`[NVIDIA NIM] ${method} ${url} - Status: ${response.status} - Duration: ${duration}ms`);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof NvidiaError) {
        throw err;
      }

      if ((err as Error)?.name === 'AbortError') {
        throw new NvidiaError({
          code: 'NVIDIA_TIMEOUT',
          provider: 'nvidia',
          message: 'NVIDIA API request timed out. Please retry.',
          statusCode: 408,
          retryable: true,
        });
      }

      throw new NvidiaError({
        code: 'NVIDIA_NETWORK_ERROR',
        provider: 'nvidia',
        message: `Failed to connect to NVIDIA NIM: ${(err as Error)?.message || 'Network error'}`,
        statusCode: 503,
        retryable: true,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Tests whether the NVIDIA provider is reachable and credentials are valid.
   */
  public async testConnection(): Promise<{
    configured: boolean;
    authenticated: boolean;
    provider: 'nvidia';
    baseUrl: string;
    error?: string;
  }> {
    const env = getEnv();
    const key = env.NVIDIA_API_KEY?.trim();
    const baseUrl = this.getBaseUrl();

    if (!key) {
      return {
        configured: false,
        authenticated: false,
        provider: 'nvidia',
        baseUrl,
        error: 'NVIDIA_API_KEY is not configured in .env',
      };
    }

    try {
      // Test with lightweight models list or minimal probe
      const res = await fetch(`${baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${key}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401) {
        return {
          configured: true,
          authenticated: false,
          provider: 'nvidia',
          baseUrl,
          error: 'NVIDIA authentication failed. Check NVIDIA_API_KEY.',
        };
      }

      return {
        configured: true,
        authenticated: res.ok || res.status !== 401,
        provider: 'nvidia',
        baseUrl,
        error: res.ok ? undefined : `NVIDIA probe returned HTTP ${res.status}`,
      };
    } catch (err: unknown) {
      return {
        configured: true,
        authenticated: false,
        provider: 'nvidia',
        baseUrl,
        error: (err as Error)?.message || 'Could not connect to NVIDIA endpoint',
      };
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;
    let rawError = '';

    try {
      const errorJson: any = await response.json();
      if (errorJson.error) {
        rawError = typeof errorJson.error === 'string' ? errorJson.error : errorJson.error.message || JSON.stringify(errorJson.error);
      } else if (errorJson.message) {
        rawError = errorJson.message;
      } else if (Array.isArray(errorJson.errors)) {
        rawError = errorJson.errors.join('; ');
      } else {
        rawError = JSON.stringify(errorJson);
      }
    } catch {
      try {
        rawError = await response.text();
      } catch {
        rawError = response.statusText;
      }
    }

    switch (status) {
      case 401:
        throw new NvidiaError({
          code: 'NVIDIA_AUTH_ERROR',
          provider: 'nvidia',
          message: 'NVIDIA API authentication failed. Check NVIDIA_API_KEY.',
          statusCode: 401,
          retryable: false,
        });

      case 403:
        throw new NvidiaError({
          code: 'NVIDIA_PERMISSION_ERROR',
          provider: 'nvidia',
          message: `NVIDIA permission denied: ${rawError || 'Access forbidden for this model or key.'}`,
          statusCode: 403,
          retryable: false,
        });

      case 404:
        throw new NvidiaError({
          code: 'NVIDIA_NOT_FOUND',
          provider: 'nvidia',
          message: `NVIDIA model or endpoint not found: ${rawError}`,
          statusCode: 404,
          retryable: false,
        });

      case 408:
        throw new NvidiaError({
          code: 'NVIDIA_TIMEOUT',
          provider: 'nvidia',
          message: 'NVIDIA request timed out.',
          statusCode: 408,
          retryable: true,
        });

      case 429:
        throw new NvidiaError({
          code: 'NVIDIA_RATE_LIMITED',
          provider: 'nvidia',
          message: 'NVIDIA rate limit reached. Please wait a few moments before trying again.',
          statusCode: 429,
          retryable: true,
        });

      default:
        throw new NvidiaError({
          code: status >= 500 ? 'NVIDIA_SERVICE_ERROR' : 'NVIDIA_REQUEST_FAILED',
          provider: 'nvidia',
          message: `NVIDIA request failed (${status}): ${rawError || response.statusText}`,
          statusCode: status,
          retryable: status >= 500,
        });
    }
  }
}

export const nvidiaClient = new NvidiaClient();
