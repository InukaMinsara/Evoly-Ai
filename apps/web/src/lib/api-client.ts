import type { StreamEvent, AIError, AIErrorCode } from '@evoly/shared';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamCallbacks {
  onStart?: (model: string) => void;
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: AIError) => void;
  onCancelled?: (partialText: string) => void;
}

const API_BASE = '/api';

// ─────────────────────────────────────────────
// SSE stream parser
// ─────────────────────────────────────────────

function parseSSELine(line: string): StreamEvent | null {
  if (!line.startsWith('data: ')) return null;
  try {
    return JSON.parse(line.slice(6)) as StreamEvent;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// AiApiClient
// ─────────────────────────────────────────────

export class AiApiClient {
  private abortController: AbortController | null = null;

  /**
   * Returns whether a request is currently in flight.
   */
  get isStreaming(): boolean {
    return this.abortController !== null;
  }

  /**
   * Abort the current streaming request.
   */
  abort(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  /**
   * Send a chat request and stream the response via SSE.
   */
  async streamChat(
    messages: ChatMessage[],
    callbacks: StreamCallbacks,
    modelOverride?: string,
  ): Promise<void> {
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    let fullText = '';

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model: modelOverride }),
        signal,
      });

      if (!response.ok) {
        let errorMessage = `Request failed (${response.status})`;
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) errorMessage = data.error;
        } catch {
          // ignore parse error
        }

        const code: AIErrorCode =
          response.status === 400
            ? 'INVALID_REQUEST'
            : response.status === 401
              ? 'INVALID_API_KEY'
              : response.status === 429
                ? 'RATE_LIMITED'
                : 'PROVIDER_ERROR';

        callbacks.onError({
          code,
          message: errorMessage,
          retryable: response.status === 429 || response.status >= 500,
        });
        return;
      }

      if (!response.body) {
        callbacks.onError({
          code: 'EMPTY_RESPONSE',
          message: 'No response body received.',
          retryable: false,
        });
        return;
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        if (signal.aborted) {
          reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const event = parseSSELine(trimmed);
          if (!event) continue;

          switch (event.type) {
            case 'start':
              callbacks.onStart?.(
                (event as unknown as Record<string, string>)['model'] ?? '',
              );
              break;

            case 'token':
              if (event.token) {
                fullText += event.token;
                callbacks.onToken(event.token);
              }
              break;

            case 'complete':
              callbacks.onComplete(fullText);
              this.abortController = null;
              return;

            case 'cancelled':
              callbacks.onCancelled?.(fullText);
              this.abortController = null;
              return;

            case 'error': {
              const errEvent = event as unknown as {
                code?: AIErrorCode;
                message?: string;
                retryable?: boolean;
              };
              callbacks.onError({
                code: errEvent.code ?? 'UNKNOWN',
                message: errEvent.message ?? 'Unknown error occurred.',
                retryable: errEvent.retryable ?? false,
              });
              this.abortController = null;
              return;
            }
          }
        }
      }

      // If signal was aborted mid-stream
      if (signal.aborted) {
        callbacks.onCancelled?.(fullText);
      } else {
        // Stream ended without explicit complete event
        callbacks.onComplete(fullText);
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'AbortError') {
        callbacks.onCancelled?.(fullText);
      } else {
        callbacks.onError({
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
          retryable: true,
        });
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Fetch AI status.
   */
  async getStatus(): Promise<{ status: string; model?: string; message?: string }> {
    const response = await fetch(`${API_BASE}/ai/status`);
    return response.json() as Promise<{ status: string; model?: string; message?: string }>;
  }

  /**
   * Test connection.
   */
  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    const response = await fetch(`${API_BASE}/ai/test`, { method: 'POST' });
    return response.json() as Promise<{
      connected: boolean;
      message: string;
      latencyMs?: number;
    }>;
  }
}

// Singleton
export const aiApiClient = new AiApiClient();
