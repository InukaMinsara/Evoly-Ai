import { useState, useCallback, useEffect } from 'react';
import type { Conversation } from '@evoly/shared';
import { chatRepository } from '../lib/chat-repository';

export interface UseConversationsReturn {
  conversations: Conversation[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredConversations: Conversation[];
  refresh: () => void;
  updateConversation: (conv: Conversation) => void;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(() => {
    setConversations(chatRepository.getAll());
  }, []);

  // Load on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateConversation = useCallback((conv: Conversation) => {
    setConversations((prev) => {
      const existing = prev.findIndex((c) => c.id === conv.id);
      if (existing === -1) {
        return [conv, ...prev];
      }
      const updated = [...prev];
      updated[existing] = conv;
      return updated.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    });
  }, []);

  const filteredConversations = searchQuery.trim()
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.messages.some((m) =>
            m.content.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    : conversations;

  return {
    conversations,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    refresh,
    updateConversation,
  };
}
