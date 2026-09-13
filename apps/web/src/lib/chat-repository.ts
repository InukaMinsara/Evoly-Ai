import { v4 as uuidv4 } from 'uuid';
import type { Conversation, Message, MessageRole } from '@evoly/shared';

// ─────────────────────────────────────────────
// Repository interface
// ─────────────────────────────────────────────

export interface ChatRepository {
  getAll(): Conversation[];
  getById(id: string): Conversation | null;
  save(conversation: Conversation): void;
  delete(id: string): void;
  clear(): void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function createConversation(title = 'New Chat'): Conversation {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createMessage(role: MessageRole, content: string): Message {
  return {
    id: uuidv4(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
// LocalChatRepository
// localStorage-based implementation.
// Designed to be swapped for a Supabase
// implementation in a future step.
// ─────────────────────────────────────────────

const STORAGE_KEY = 'evoly_conversations';
const MAX_CONVERSATIONS = 50;

export class LocalChatRepository implements ChatRepository {
  private loadAll(): Map<string, Conversation> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Map();
      const parsed = JSON.parse(raw) as Conversation[];
      return new Map(parsed.map((c) => [c.id, c]));
    } catch {
      return new Map();
    }
  }

  private persistAll(map: Map<string, Conversation>): void {
    try {
      const arr = Array.from(map.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // Storage quota or serialization error — ignore silently
    }
  }

  getAll(): Conversation[] {
    const map = this.loadAll();
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  getById(id: string): Conversation | null {
    return this.loadAll().get(id) ?? null;
  }

  save(conversation: Conversation): void {
    const map = this.loadAll();
    conversation.updatedAt = new Date().toISOString();
    map.set(conversation.id, conversation);

    // Trim to max
    if (map.size > MAX_CONVERSATIONS) {
      const sorted = Array.from(map.values()).sort(
        (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
      const toDelete = sorted.slice(0, map.size - MAX_CONVERSATIONS);
      for (const c of toDelete) {
        map.delete(c.id);
      }
    }

    this.persistAll(map);
  }

  delete(id: string): void {
    const map = this.loadAll();
    map.delete(id);
    this.persistAll(map);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Singleton
export const chatRepository: ChatRepository = new LocalChatRepository();
