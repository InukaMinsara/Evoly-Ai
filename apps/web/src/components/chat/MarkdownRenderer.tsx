import 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

const components: Components = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code({ className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const inline = !match && !String(children).includes('\n');

    if (inline) {
      return (
        <code
          className="bg-surface-border/60 text-evoly-300 px-1.5 py-0.5 rounded text-xs font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    const language = match?.[1] ?? 'plaintext';
    return (
      <CodeBlock
        language={language}
        code={String(children)}
      />
    );
  },

  // Override pre so it doesn't double-wrap
  pre({ children }) {
    return <>{children}</>;
  },

  // Custom image rendering for AI-generated images
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  img({ src, alt }: any) {
    return (
      <div className="my-3 rounded-xl overflow-hidden border border-surface-border bg-black/40 max-w-xl">
        <img
          src={src}
          alt={alt || 'Generated Image'}
          className="w-full max-h-[512px] object-contain rounded-t-xl"
          loading="lazy"
        />
        {alt && (
          <div className="px-3.5 py-2 text-[11px] text-slate-400 bg-surface-card/70 border-t border-surface-border/50">
            {alt}
          </div>
        )}
      </div>
    );
  },
};

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  let thinkContent = '';
  let mainContent = content;

  // Extract <think>...</think> block
  const thinkMatch = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
  if (thinkMatch) {
    thinkContent = thinkMatch[1].trim();
    // Remove the think block from the main content
    mainContent = content.replace(/<think>[\s\S]*?(?:<\/think>|$)/, '').trim();
  }

  const isThinkingIncomplete = Boolean(thinkMatch && !content.includes('</think>'));

  return (
    <div className="space-y-3 w-full">
      {/* Thinking Process Widget */}
      {thinkMatch && (
        <details
          className="bg-surface-card/40 rounded-xl border border-surface-border/60 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
          open={isStreaming && isThinkingIncomplete}
        >
          <summary className="px-4 py-2.5 text-xs font-semibold text-slate-400 cursor-pointer hover:bg-surface-hover/50 transition-colors select-none flex items-center gap-2 outline-none">
            {isStreaming && isThinkingIncomplete ? (
              <span className="w-4 h-4 flex items-center justify-center animate-pulse">🧠</span>
            ) : (
              <span className="w-4 h-4 flex items-center justify-center opacity-80">💭</span>
            )}
            <span className="flex-1">
              {isStreaming && isThinkingIncomplete ? 'Thinking process...' : 'View thinking process'}
            </span>
          </summary>
          <div className="px-4 py-3 text-[13px] text-slate-400 border-t border-surface-border/50 bg-black/20">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkContent}</ReactMarkdown>
          </div>
        </details>
      )}

      {/* Main Content */}
      {mainContent && (
        <div className={`message-prose ${isStreaming && !isThinkingIncomplete ? 'streaming-cursor' : ''}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {mainContent}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
