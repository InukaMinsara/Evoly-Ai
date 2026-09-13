import 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ChatError } from '../../hooks/useChat';
import { cn } from '../../lib/utils';

interface ErrorBannerProps {
  error: ChatError;
  onDismiss: () => void;
  onRetry?: () => void;
}

const ERROR_DISPLAY: Record<string, { title: string; description: string }> = {
  NOT_CONFIGURED: {
    title: 'AI service not configured',
    description: 'The Groq API key is missing. Please check server configuration.',
  },
  INVALID_API_KEY: {
    title: 'Invalid API key',
    description: 'The configured Groq API key is invalid. Please check server configuration.',
  },
  RATE_LIMITED: {
    title: 'Rate limit reached',
    description: 'Too many requests. Please wait a moment before trying again.',
  },
  NETWORK_ERROR: {
    title: 'Network error',
    description: 'Could not connect to the AI service. Check your internet connection.',
  },
  PROVIDER_ERROR: {
    title: 'AI service error',
    description: 'Groq returned an unexpected error. Please try again.',
  },
  INVALID_REQUEST: {
    title: 'Invalid request',
    description: 'The request was invalid. Please try rephrasing your message.',
  },
  EMPTY_RESPONSE: {
    title: 'Empty response',
    description: 'The AI returned an empty response. Please try again.',
  },
  TIMEOUT: {
    title: 'Request timed out',
    description: 'The request took too long. Please try again.',
  },
  ABORTED: {
    title: 'Request cancelled',
    description: 'The request was cancelled.',
  },
};

export function ErrorBanner({ error, onDismiss, onRetry }: ErrorBannerProps) {
  const display = ERROR_DISPLAY[error.code] ?? {
    title: 'Something went wrong',
  };

  return (
    <div
      className={cn(
        'mx-4 mb-4 flex items-start gap-3 rounded-xl border px-4 py-3',
        'bg-red-950/30 border-red-800/40 animate-fade-in',
      )}
      role="alert"
    >
      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-300">{display.title}</p>
        <p className="text-xs text-red-400/80 mt-0.5">{error.message}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {error.retryable && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-red-900/40 text-red-300 hover:bg-red-800/50 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
        <button
          onClick={onDismiss}
          className="text-xs px-2.5 py-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-900/30 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
