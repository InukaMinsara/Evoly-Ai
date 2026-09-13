import {
  useRef,
  useState,
  useCallback,
  useEffect,
  KeyboardEvent,
} from 'react';
import { Send, Square, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ChatStatus } from '../../hooks/useChat';

interface MessageComposerProps {
  onSend: (content: string, images?: string[]) => void;
  onStop: () => void;
  status: ChatStatus;
  disabled?: boolean;
}

export function MessageComposer({
  onSend,
  onStop,
  status,
  disabled,
}: MessageComposerProps) {
  const [value, setValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const isStreaming = status === 'streaming';
  const canSend = (value.trim().length > 0 || files.length > 0) && !isStreaming && !disabled && !isProcessingFiles;

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 200;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Listen for suggestion chips
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setValue(detail);
      setTimeout(() => textareaRef.current?.focus(), 50);
    };
    document.addEventListener('evoly:suggestion', handler);
    return () => document.removeEventListener('evoly:suggestion', handler);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
    // reset input so the same file can be selected again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = useCallback(async () => {
    const trimmed = value.trim();
    if ((!trimmed && files.length === 0) || isStreaming || isProcessingFiles) return;

    setIsProcessingFiles(true);
    try {
      let finalContent = trimmed;
      const images: string[] = [];

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          // Read image as base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          images.push(base64);
        } else {
          // Read text file
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
          finalContent += `\n\nAttached File: ${file.name}\n\`\`\`\n${text}\n\`\`\``;
        }
      }

      onSend(finalContent.trim(), images);
      setValue('');
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to process files:', err);
    } finally {
      setIsProcessingFiles(false);
    }
  }, [value, files, isStreaming, isProcessingFiles, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && isStreaming) {
      onStop();
    }
  };

  return (
    <div className="border-t border-surface-border bg-surface/80 backdrop-blur-sm px-2.5 sm:px-4 py-2.5 sm:py-4">
      <div className="max-w-3xl mx-auto">
        <div
          className={cn(
            'flex flex-col bg-surface-card border rounded-2xl p-2 transition-all duration-150',
            'focus-within:border-evoly-600/60 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
            isStreaming ? 'border-evoly-600/40' : 'border-surface-border',
          )}
        >
          {/* Attachments Preview */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border-b border-surface-border/50 mb-2">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-surface-border group relative pr-8"
                >
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-xs text-slate-300 max-w-[150px] truncate" title={file.name}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-red-400 hover:bg-surface-border/50 rounded-md transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 sm:gap-3 px-1.5 sm:px-2 py-1">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />

            {/* Attach */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming || isProcessingFiles}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors mb-0.5 p-1 rounded-lg hover:bg-surface-border/50"
              title="Attach files or images"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? 'EVOLY AI is responding...' : isProcessingFiles ? 'Processing attachments...' : 'Ask anything about robotics, Arduino, ESP32…'}
              rows={1}
              disabled={disabled || isProcessingFiles}
              className={cn(
                'flex-1 min-w-0 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none leading-relaxed',
                'min-h-[24px] max-h-[200px]',
              )}
              aria-label="Message input"
              aria-multiline="true"
            />

            {/* Stop / Send */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all"
                aria-label="Stop generation"
                title="Stop generation (Esc)"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150',
                  canSend
                    ? 'bg-evoly-600 text-white hover:bg-evoly-500 shadow-lg shadow-evoly-900/50'
                    : 'bg-surface-border/50 text-slate-600 cursor-not-allowed',
                  isProcessingFiles && 'animate-pulse'
                )}
                aria-label="Send message"
                title="Send (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-slate-600">
          {isStreaming
            ? 'Press Esc or click ■ to stop · '
            : 'Enter to send · Shift+Enter for new line · '}
          <span className="text-slate-700">EVOLY AI can make mistakes.</span>
        </p>
      </div>
    </div>
  );
}
