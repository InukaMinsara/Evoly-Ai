import { useEffect, useRef, useCallback } from 'react';
import type { Conversation } from '@evoly/shared';
import { MessageBubble } from './MessageBubble';
import { cn } from '../../lib/utils';
import type { ChatStatus } from '../../hooks/useChat';

interface MessageListProps {
  conversation: Conversation | null;
  status: ChatStatus;
  streamingContent: string;
  onRegenerate: () => void;
  onEditAndResend: (messageId: string, newContent: string) => void;
}

export function MessageList({
  conversation,
  status,
  streamingContent,
  onRegenerate,
  onEditAndResend,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'end',
    });
  }, []);

  // Scroll on new messages or streaming tokens
  useEffect(() => {
    if (!isUserScrolledUp.current) {
      scrollToBottom(status === 'streaming');
    }
  }, [conversation?.messages.length, streamingContent, status, scrollToBottom]);

  // Detect if user has scrolled up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 120;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // On new conversation load, scroll to bottom instantly
  useEffect(() => {
    isUserScrolledUp.current = false;
    scrollToBottom(false);
  }, [conversation?.id, scrollToBottom]);

  const messages = conversation?.messages ?? [];
  const isStreaming = status === 'streaming';

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        {/* Empty state */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-evoly-600 to-evoly-800 flex items-center justify-center mb-6 shadow-lg shadow-evoly-900/50">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          What can I help you build?
        </h2>
        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
          I'm EVOLY AI — your engineering assistant for robotics, Arduino, ESP32,
          sensors, motors, and embedded systems. Ask me anything.
        </p>

        {/* Suggestion chips */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-lg">
          {[
            'Explain PWM control for servo motors',
            'I2C communication with MPU6050',
            'HC-SR04 ultrasonic sensor code',
            'ESP32 WiFi + MQTT setup',
            'PID controller for DC motor',
            'Interrupt-driven button debounce',
          ].map((suggestion) => (
            <button
              key={suggestion}
              className="text-xs px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-slate-400 hover:text-white hover:border-evoly-600/50 hover:bg-surface-hover transition-all"
              onClick={() => {
                // We'll pass this up via a ref trick — components fire the suggestion
                const event = new CustomEvent('evoly:suggestion', {
                  detail: suggestion,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto px-4 py-6',
        'scrollbar-thin scrollbar-thumb-surface-border',
      )}
    >
      <div className="max-w-3xl mx-auto space-y-1">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isThisMessageStreaming =
            isLastMessage && isStreaming && message.role === 'assistant';

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={isThisMessageStreaming}
              streamingContent={isThisMessageStreaming ? streamingContent : undefined}
              chatStatus={status}
              onRegenerate={isLastMessage && message.role === 'assistant' ? onRegenerate : undefined}
              onEditAndResend={message.role === 'user' ? onEditAndResend : undefined}
              isLast={isLastMessage}
            />
          );
        })}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
