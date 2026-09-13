import { useState, useRef, memo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../../lib/utils';

interface CodeBlockProps {
  language: string;
  code: string;
  className?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  cpp: 'C++',
  c: 'C',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  bash: 'Bash',
  sh: 'Shell',
  json: 'JSON',
  yaml: 'YAML',
  arduino: 'Arduino',
  plaintext: 'Text',
  text: 'Text',
};

function getLanguageLabel(lang: string): string {
  return LANGUAGE_LABELS[lang.toLowerCase()] ?? lang.toUpperCase();
}

export const CodeBlock = memo(function CodeBlock({ language, code, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const displayLang = getLanguageLabel(language || 'plaintext');

  return (
    <div className={cn('my-3 rounded-xl overflow-hidden border border-surface-border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e2e] border-b border-surface-border">
        <span className="text-xs font-mono font-medium text-evoly-400 tracking-wide">
          {displayLang}
        </span>
        <button
          onClick={() => void handleCopy()}
          className={cn(
            'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all duration-150',
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-surface-border/50 text-slate-400 hover:bg-evoly-600/30 hover:text-evoly-300',
          )}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language === 'arduino' ? 'cpp' : language || 'plaintext'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem 1.25rem',
          background: '#0d0d16',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
          borderRadius: 0,
        }}
        codeTagProps={{ className: 'font-mono' }}
        showLineNumbers={code.split('\n').length > 5}
        lineNumberStyle={{ color: '#404060', minWidth: '2.5em' }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
});
