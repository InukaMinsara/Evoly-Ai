import { useCallback } from 'react';
import type { Conversation } from '@evoly/shared';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { MessageList } from '../components/chat/MessageList';
import { MessageComposer } from '../components/chat/MessageComposer';
import { ErrorBanner } from '../components/chat/ErrorBanner';
import { useChat } from '../hooks/useChat';
import { useConversations } from '../hooks/useConversations';
import { useAIStatus } from '../hooks/useAIStatus';

/**
 * AIAssistantPage — wraps the full chat UI (sidebar + topbar + messages + composer).
 * The NavRail is already rendered by AppRouter; this page fills the remaining space.
 */
export default function AIAssistantPage() {
  const {
    filteredConversations,
    searchQuery,
    setSearchQuery,
    updateConversation,
    refresh: refreshConversations,
  } = useConversations();

  const handleConversationUpdate = useCallback(
    (conv: Conversation) => {
      updateConversation(conv);
    },
    [updateConversation],
  );

  const {
    conversation,
    status,
    streamingContent,
    error,
    currentModel,
    sendMessage,
    stopGeneration,
    regenerate,
    editAndResend,
    loadConversation,
    newConversation,
    setModel,
    clearError,
  } = useChat(handleConversationUpdate);

  const aiStatus = useAIStatus();

  const handleSelectConversation = useCallback(
    (id: string) => {
      loadConversation(id);
    },
    [loadConversation],
  );

  const handleNewChat = useCallback(() => {
    newConversation();
  }, [newConversation]);

  return (
    <div className="flex-1 flex min-w-0 h-full overflow-hidden">
      {/* Chat sidebar */}
      <Sidebar
        conversations={filteredConversations}
        activeConversationId={conversation?.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onConversationsRefresh={refreshConversations}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={conversation?.title}
          currentModel={currentModel || aiStatus.model || ''}
          aiStatus={aiStatus}
          onModelChange={setModel}
        />

        {/* Not configured warning */}
        {aiStatus.status === 'not_configured' && (
          <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-amber-700/40 bg-amber-950/30 px-4 py-3">
            <span className="text-amber-400 text-sm">⚠️</span>
            <p className="text-sm text-amber-300">
              <strong>AI service not configured.</strong> Add{' '}
              <code className="bg-amber-900/40 px-1 rounded text-xs">GROQ_API_KEY</code>{' '}
              to <code className="bg-amber-900/40 px-1 rounded text-xs">apps/api/.env</code> and restart the server.
            </p>
          </div>
        )}

        {/* Messages */}
        <MessageList
          conversation={conversation}
          status={status}
          streamingContent={streamingContent}
          onRegenerate={() => void regenerate()}
          onEditAndResend={editAndResend}
        />

        {/* Error banner */}
        {error && (
          <ErrorBanner
            error={error}
            onDismiss={clearError}
            onRetry={error.retryable ? () => void regenerate() : undefined}
          />
        )}

        {/* Composer */}
        <MessageComposer
          onSend={(content) => void sendMessage(content)}
          onStop={stopGeneration}
          status={status}
          disabled={aiStatus.status === 'not_configured'}
        />
      </div>
    </div>
  );
}
