import Groq from 'groq-sdk';
import { AIError, AIErrorCode, StreamEvent } from '@evoly/shared';
import { getEnv } from '../config/env';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

export type GroqMessage = ChatCompletionMessageParam;

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: AIError) => void;
}

// ─────────────────────────────────────────────
// Error mapping
// ─────────────────────────────────────────────

function mapGroqError(err: unknown): AIError {
  const error = err as { status?: number; code?: string; message?: string };
  const details = error.message ? ` (${error.message})` : '';

  if (error.status === 401) {
    return {
      code: 'INVALID_API_KEY',
      message: `Invalid Groq API key. Please check your configuration.${details}`,
      retryable: false,
    };
  }

  if (error.status === 429) {
    return {
      code: 'RATE_LIMITED',
      message: `Groq rate limit reached.${details}`,
      retryable: true,
    };
  }

  if (error.status === 400) {
    return {
      code: 'INVALID_REQUEST',
      message: `Invalid request sent to Groq.${details}`,
      retryable: false,
    };
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return {
      code: 'NETWORK_ERROR',
      message: `Network error connecting to Groq.${details}`,
      retryable: true,
    };
  }

  if (error.status && error.status >= 500) {
    return {
      code: 'PROVIDER_ERROR',
      message: `Groq service error.${details}`,
      retryable: true,
    };
  }

  return {
    code: 'UNKNOWN',
    message: `An unexpected error occurred.${details}`,
    retryable: false,
  };
}

// ─────────────────────────────────────────────
// GroqService
// ─────────────────────────────────────────────

export class GroqService {
  private client: Groq | null;
  private model: string;

  constructor() {
    const env = getEnv();
    if (env.GROQ_API_KEY) {
      this.client = new Groq({ apiKey: env.GROQ_API_KEY });
    } else {
      this.client = null;
    }
    this.model = env.GROQ_MODEL;
  }

  getModel(): string {
    return this.model;
  }

  /**
   * Stream a chat completion to callbacks.
   * Resolves with the full accumulated text.
   * signal can be used to abort the stream.
   */
  async streamChat(
    messages: GroqMessage[],
    callbacks: StreamCallbacks,
    signal?: AbortSignal,
    modelOverride?: string,
  ): Promise<string> {
    if (!this.client) {
      const error: AIError = {
        code: 'NOT_CONFIGURED',
        message: 'AI service is not configured. Missing API key.',
        retryable: false,
      };
      callbacks.onError(error);
      throw error;
    }

    const model = modelOverride ?? this.model;
    let fullText = '';

    try {
      const stream = await this.client.chat.completions.create(
        {
          model,
          messages,
          stream: true,
          max_tokens: 1000,
          temperature: 0.7,
        },
        { signal },
      );

      for await (const chunk of stream) {
        if (signal?.aborted) {
          break;
        }

        const token = chunk.choices[0]?.delta?.content ?? '';
        if (token) {
          fullText += token;
          callbacks.onToken(token);
        }
      }

      callbacks.onComplete(fullText);
      return fullText;
    } catch (err: unknown) {
      // Aborted — not an error, just stopped
      if (
        signal?.aborted ||
        (err as { name?: string }).name === 'AbortError'
      ) {
        callbacks.onComplete(fullText);
        return fullText;
      }

      const aiError = mapGroqError(err);
      callbacks.onError(aiError);
      throw aiError;
    }
  }

  /**
   * Minimal connectivity test — sends a tiny request.
   */
  async testConnection(): Promise<{ ok: boolean; latencyMs: number }> {
    if (!this.client) {
      throw { code: 'NOT_CONFIGURED', message: 'Missing API key' };
    }
    const start = Date.now();
    try {
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false,
      });
      return { ok: true, latencyMs: Date.now() - start };
    } catch (err: unknown) {
      throw mapGroqError(err);
    }
  }
}

// ─────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────

let _instance: GroqService | null = null;

export function getGroqService(): GroqService {
  if (!_instance) {
    _instance = new GroqService();
  }
  return _instance;
}

export function _resetGroqServiceForTest(): void {
  _instance = null;
}

// Re-export StreamEvent so route can use it
export type { StreamEvent, AIError, AIErrorCode };
