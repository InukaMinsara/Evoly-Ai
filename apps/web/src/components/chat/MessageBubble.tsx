import { useState, memo } from 'react';
import { Copy, Check, RotateCcw, Pencil, Send, X } from 'lucide-react';
import type { Message } from '@evoly/shared';
import { MarkdownRenderer } from './MarkdownRenderer';
import { cn, copyToClipboard } from '../../lib/utils';
import type { ChatStatus } from '../../hooks/useChat';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: string;
  chatStatus: ChatStatus;
  onRegenerate?: () => void;
  onEditAndResend?: (messageId: string, newContent: string) => void;
  isLast?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming,
  streamingContent,
  chatStatus,
  onRegenerate,
  onEditAndResend,
  isLast,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const displayContent =
    isStreaming && streamingContent !== undefined
      ? streamingContent
      : message.content;

  const handleCopy = async () => {
    await copyToClipboard(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEditAndResend?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  // ─────────────────────────────────────────────
  // User message
  // ─────────────────────────────────────────────
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4 group animate-fade-in">
        <div className="max-w-[80%] space-y-1">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-w-[300px] bg-surface-card border border-evoly-600/50 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-evoly-500"
                rows={Math.min(editContent.split('\n').length + 1, 8)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSubmit();
                  }
                  if (e.key === 'Escape') handleEditCancel();
                }}
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={handleEditCancel}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-surface-border/50 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={!editContent.trim()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-evoly-600 text-white hover:bg-evoly-500 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  Resend
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-evoly-600/20 border border-evoly-600/30 rounded-2xl rounded-tr-sm px-4 py-3">
                {message.images && message.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {message.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Attachment ${idx + 1}`}
                        className="max-w-[200px] max-h-[200px] object-cover rounded-lg border border-evoly-600/40"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
              {/* Actions — show on hover */}
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={chatStatus === 'streaming'}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-surface-hover transition-colors disabled:opacity-30"
                  title="Edit and resend"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Assistant message
  // ─────────────────────────────────────────────
  return (
    <div className="mb-6 group animate-slide-up">
      {/* Avatar + Name */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-bold text-white">EV</span>
        </div>
        <span className="text-xs font-semibold text-evoly-400 tracking-wide uppercase">
          EVOLY AI
        </span>
        {isStreaming && (
          <span className="text-[10px] text-slate-500 ml-1">thinking...</span>
        )}
      </div>

      {/* Content */}
      <div className="pl-8">
        {/* Tool Activity */}
        {message.toolActivity && message.toolActivity.length > 0 && (
          <div className="mb-3 space-y-2">
            {message.toolActivity.map((tool) => (
              <div key={tool.id} className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-surface-card/40 border border-surface-border/50 px-3 py-1.5 rounded-lg w-fit">
                  {tool.status === 'running' ? (
                    <span className="w-3 h-3 border-2 border-slate-500 border-t-evoly-500 rounded-full animate-spin flex-shrink-0" />
                  ) : tool.status === 'success' ? (
                    <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <X className="w-3 h-3 text-red-500 flex-shrink-0" />
                  )}
                  <span className="font-medium">
                    {tool.tool === 'webSearch' ? 'Searching web...' :
                     tool.tool === 'placesSearch' ? 'Searching places...' :
                     tool.tool === 'generateImage' || tool.tool === 'imageGeneration' ? 'NVIDIA NIM Image Generation' :
                     tool.tool === 'editImage' ? 'NVIDIA NIM Image Edit' :
                     `Using ${tool.tool}...`}
                  </span>
                </div>

                {tool.status === 'error' && tool.result?.error && (
                  <div className="px-3.5 py-2 text-xs bg-red-500/10 border border-red-500/25 rounded-lg text-red-300 max-w-lg">
                    {tool.result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {displayContent ? (
          <MarkdownRenderer
            content={displayContent}
            isStreaming={isStreaming && displayContent === streamingContent}
          />
        ) : isStreaming ? (
          <div className="flex items-center gap-1.5 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-evoly-500 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-evoly-500 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-evoly-500 animate-bounce [animation-delay:300ms]" />
          </div>
        ) : null}

        {/* Action buttons */}
        {!isStreaming && displayContent && isLast && (
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => void handleCopy()}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all',
                copied
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-surface-hover',
              )}
              title="Copy response"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={chatStatus === 'streaming'}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-surface-hover transition-colors disabled:opacity-30"
                title="Regenerate response"
              >
                <RotateCcw className="w-3 h-3" />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
