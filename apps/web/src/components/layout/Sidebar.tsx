import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import type { Conversation } from '@evoly/shared';
import { cn, formatTimestamp, truncateText } from '../../lib/utils';
import { chatRepository } from '../../lib/chat-repository';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId?: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onConversationsRefresh: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  onNewChat,
  onConversationsRefresh,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    chatRepository.delete(id);
    onConversationsRefresh();
  };

  if (collapsed) {
    return (
      <aside className="w-14 h-full bg-surface-card border-r border-surface-border flex flex-col items-center py-4 gap-3 flex-shrink-0">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">EV</span>
        </div>

        <div className="h-px w-8 bg-surface-border my-1" />

        <button
          onClick={onNewChat}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setCollapsed(false)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-surface-hover transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-72 h-full bg-surface-card border-r border-surface-border flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-white">EV</span>
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">EVOLY</span>
            <span className="text-sm font-bold text-evoly-400 tracking-tight"> AI</span>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-surface-hover transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 mb-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-evoly-600/15 border border-evoly-600/30 text-evoly-300 hover:bg-evoly-600/25 hover:text-white transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 mb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-border/30 border border-surface-border">
          <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {conversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-600">
              {searchQuery ? 'No matching chats' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              const isActive = conv.id === activeConversationId;

              return (
                <div
                  key={conv.id}
                  className={cn(
                    'group relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all',
                    isActive
                      ? 'bg-evoly-600/20 border border-evoly-600/30'
                      : 'hover:bg-surface-hover border border-transparent',
                  )}
                  onClick={() => onSelectConversation(conv.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectConversation(conv.id)}
                  aria-label={`Open conversation: ${conv.title}`}
                  aria-selected={isActive}
                >
                  <MessageSquare
                    className={cn(
                      'w-3.5 h-3.5 mt-0.5 flex-shrink-0',
                      isActive ? 'text-evoly-400' : 'text-slate-600',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-xs font-medium truncate',
                        isActive ? 'text-white' : 'text-slate-300',
                      )}
                    >
                      {conv.title}
                    </p>
                    {lastMsg && (
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {truncateText(lastMsg.content.replace(/\n/g, ' '), 60)}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-700 mt-1">
                      {formatTimestamp(conv.updatedAt)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-surface-border">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[11px] text-slate-600">
            Local history — stored on this device
          </span>
        </div>
      </div>
    </aside>
  );
}
