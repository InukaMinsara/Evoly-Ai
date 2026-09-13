import { useState, useCallback, useRef } from 'react';
import type { Conversation } from '@evoly/shared';
import { aiApiClient } from '../lib/api-client';
import {
  chatRepository,
  createConversation,
  createMessage,
} from '../lib/chat-repository';
import { generateChatTitle } from '../lib/utils';

// ─────────────────────────────────────────────
// State types
// ─────────────────────────────────────────────

export type ChatStatus =
  | 'idle'
  | 'streaming'
  | 'completed'
  | 'error'
  | 'cancelled';

export interface ChatError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface UseChatState {
  conversation: Conversation | null;
  status: ChatStatus;
  streamingContent: string;
  error: ChatError | null;
  currentModel: string;
}

export interface UseChatActions {
  sendMessage: (content: string, images?: string[]) => Promise<void>;
  stopGeneration: () => void;
  regenerate: () => Promise<void>;
  editAndResend: (messageId: string, newContent: string) => Promise<void>;
  loadConversation: (id: string) => void;
  newConversation: () => void;
  setModel: (model: string) => void;
  clearError: () => void;
}

export type UseChatReturn = UseChatState & UseChatActions;

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useChat(
  onConversationUpdate?: (conv: Conversation) => void,
): UseChatReturn {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<ChatError | null>(null);
  const [currentModel, setCurrentModel] = useState('');

  // Ref for last user message (for regenerate)
  const lastUserMessageRef = useRef<string>('');





  // ─────────────────────────────────────────────
  // Streaming core
  // ─────────────────────────────────────────────

  const performStream = useCallback(
    async (
      conv: Conversation,
      messagesToSend: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    ) => {
      setStatus('streaming');
      setStreamingContent('');
      setError(null);

      // Placeholder assistant message
      const assistantMsg = createMessage('assistant', '');
      setConversation((prev) => {
        if (!prev || prev.id !== conv.id) return prev;
        const updated = {
          ...prev,
          messages: [...prev.messages, assistantMsg],
        };
        chatRepository.save(updated);
        return updated;
      });

      let accumulated = '';

      await aiApiClient.streamChat(
        messagesToSend,
        {
          onStart: (model) => {
            if (model) setCurrentModel(model);
          },
          onToken: (token) => {
            accumulated += token;
            setStreamingContent(accumulated);

            // Update the placeholder in real-time
            setConversation((prev) => {
              if (!prev || prev.id !== conv.id) return prev;
              const messages = [...prev.messages];
              const lastIdx = messages.length - 1;
              if (lastIdx >= 0 && messages[lastIdx]?.id === assistantMsg.id) {
                messages[lastIdx] = { ...messages[lastIdx]!, content: accumulated };
              }
              return { ...prev, messages };
            });
          },
          onComplete: (fullText) => {
            setStreamingContent('');
            setStatus('completed');
            setConversation((prev) => {
              if (!prev || prev.id !== conv.id) return prev;
              const messages = [...prev.messages];
              const lastIdx = messages.length - 1;
              if (lastIdx >= 0 && messages[lastIdx]?.id === assistantMsg.id) {
                messages[lastIdx] = { ...messages[lastIdx]!, content: fullText };
              }
              const updated = { ...prev, messages };
              chatRepository.save(updated);
              onConversationUpdate?.(updated);
              return updated;
            });
          },
          onCancelled: (partialText) => {
            setStreamingContent('');
            setStatus('cancelled');
            setConversation((prev) => {
              if (!prev || prev.id !== conv.id) return prev;
              const messages = [...prev.messages];
              const lastIdx = messages.length - 1;
              if (lastIdx >= 0 && messages[lastIdx]?.id === assistantMsg.id) {
                messages[lastIdx] = {
                  ...messages[lastIdx]!,
                  content: partialText || '*(generation stopped)*',
                };
              }
              const updated = { ...prev, messages };
              chatRepository.save(updated);
              return updated;
            });
          },
          onError: (err) => {
            setStreamingContent('');
            setStatus('error');
            setError(err);
            // Remove empty assistant placeholder
            setConversation((prev) => {
              if (!prev || prev.id !== conv.id) return prev;
              const messages = prev.messages.filter(
                (m) => m.id !== assistantMsg.id || m.content !== '',
              );
              return { ...prev, messages };
            });
          },
        },
        currentModel || undefined,
      );
    },
    [currentModel, onConversationUpdate],
  );

  // ─────────────────────────────────────────────
  // Public actions
  // ─────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      if (!content.trim() && (!images || images.length === 0)) return;
      if (status === 'streaming') return;

      // Get or create conversation
      let conv = conversation;
      if (!conv) {
        conv = createConversation('New Chat');
        setConversation(conv);
      }

      // Save user message
      const userMsg = createMessage('user', content);
      if (images && images.length > 0) {
        userMsg.images = images;
      }
      lastUserMessageRef.current = content;

      // Generate title from first message
      const isFirstMessage = conv.messages.length === 0;
      const updatedConv: Conversation = {
        ...conv,
        title: isFirstMessage ? generateChatTitle(content) : conv.title,
        messages: [...conv.messages, userMsg],
        updatedAt: new Date().toISOString(),
      };
      chatRepository.save(updatedConv);
      setConversation(updatedConv);
      onConversationUpdate?.(updatedConv);

      const messagesToSend = updatedConv.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content, images: m.images }));

      await performStream(updatedConv, messagesToSend);
    },
    [conversation, status, performStream, onConversationUpdate],
  );

  const stopGeneration = useCallback(() => {
    aiApiClient.abort();
  }, []);

  const regenerate = useCallback(async () => {
    if (!conversation || status === 'streaming') return;

    // Remove last assistant message
    const messages = [...conversation.messages];
    while (messages.length > 0 && messages[messages.length - 1]?.role === 'assistant') {
      messages.pop();
    }

    const updatedConv = { ...conversation, messages };
    chatRepository.save(updatedConv);
    setConversation(updatedConv);

    const messagesToSend = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content, images: m.images }));

    await performStream(updatedConv, messagesToSend);
  }, [conversation, status, performStream]);

  const editAndResend = useCallback(
    async (messageId: string, newContent: string) => {
      if (!conversation || status === 'streaming') return;

      const msgIndex = conversation.messages.findIndex((m) => m.id === messageId);
      if (msgIndex === -1) return;

      // Keep messages up to and including the edited one
      const messages = conversation.messages
        .slice(0, msgIndex)
        .concat([{ ...conversation.messages[msgIndex]!, content: newContent }]);

      const updatedConv = { ...conversation, messages };
      chatRepository.save(updatedConv);
      setConversation(updatedConv);
      lastUserMessageRef.current = newContent;

      const messagesToSend = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content, images: m.images }));

      await performStream(updatedConv, messagesToSend);
    },
    [conversation, status, performStream],
  );

  const loadConversation = useCallback((id: string) => {
    const conv = chatRepository.getById(id);
    if (conv) {
      setConversation(conv);
      setStatus('idle');
      setStreamingContent('');
      setError(null);
    }
  }, []);

  const newConversation = useCallback(() => {
    setConversation(null);
    setStatus('idle');
    setStreamingContent('');
    setError(null);
    aiApiClient.abort();
  }, []);

  const setModel = useCallback((model: string) => {
    setCurrentModel(model);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setStatus('idle');
  }, []);

  return {
    // State
    conversation,
    status,
    streamingContent,
    error,
    currentModel,
    // Actions
    sendMessage,
    stopGeneration,
    regenerate,
    editAndResend,
    loadConversation,
    newConversation,
    setModel,
    clearError,
  };
}
