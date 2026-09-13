import React from 'react';
import { Cpu, ChevronDown, Wifi, WifiOff, Loader2, History } from 'lucide-react';
import type { AIStatus } from '../../hooks/useAIStatus';
import { cn } from '../../lib/utils';

interface TopBarProps {
  title?: string;
  currentModel: string;
  aiStatus: AIStatus;
  onModelChange?: (model: string) => void;
  onToggleHistory?: () => void;
}

const MODEL_GROUPS = [
  {
    provider: 'Alibaba Cloud',
    models: [
      { id: 'qwen/qwen3.6-27b', label: 'qwen/qwen3.6-27b' },
      { id: 'qwen/qwen3.8-27b', label: 'qwen/qwen3.8-27b' },
    ],
  },
  {
    provider: 'Canopy Labs',
    models: [
      { id: 'canopylabs/orpheus-arabic-saudi', label: 'canopylabs/orpheus-arabic-saudi' },
      { id: 'canopylabs/orpheus-v1-english', label: 'canopylabs/orpheus-v1-english' },
    ],
  },
  {
    provider: 'Groq',
    models: [
      { id: 'groq/compound', label: 'groq/compound' },
      { id: 'groq/compound-mini', label: 'groq/compound-mini' },
    ],
  },
  {
    provider: 'Meta',
    models: [
      { id: 'meta-llama/llama-prompt-guard-2-22m', label: 'meta-llama/llama-prompt-guard-2-22m' },
      { id: 'meta-llama/llama-prompt-guard-2-86m', label: 'meta-llama/llama-prompt-guard-2-86m' },
    ],
  },
  {
    provider: 'OpenAI',
    models: [
      { id: 'openai/gpt-oss-120b', label: 'openai/gpt-oss-120b' },
      { id: 'openai/gpt-oss-20b', label: 'openai/gpt-oss-20b' },
      { id: 'openai/gpt-oss-safeguard-20b', label: 'openai/gpt-oss-safeguard-20b' },
      { id: 'whisper-large-v3', label: 'whisper-large-v3' },
      { id: 'whisper-large-v3-turbo', label: 'whisper-large-v3-turbo' },
    ],
  },
];

export function TopBar({ title, currentModel, aiStatus, onModelChange, onToggleHistory }: TopBarProps) {
  const [modelOpen, setModelOpen] = React.useState(false);

  const flatModels = MODEL_GROUPS.flatMap(g => g.models);
  const displayModel =
    flatModels.find((m) => m.id === currentModel)?.label ??
    currentModel ??
    'Loading...';

  const StatusIcon = () => {
    if (aiStatus.status === 'loading') {
      return <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />;
    }
    if (aiStatus.status === 'configured') {
      return <Wifi className="w-3 h-3 text-green-400" />;
    }
    return <WifiOff className="w-3 h-3 text-red-400" />;
  };

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-5 border-b border-surface-border bg-surface-card/50 backdrop-blur-sm flex-shrink-0">
      {/* Title & Mobile History Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleHistory && (
          <button
            onClick={onToggleHistory}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors flex-shrink-0"
            title="Chat History"
            aria-label="Toggle chat history"
          >
            <History className="w-4 h-4 text-evoly-400" />
          </button>
        )}
        <h1 className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-[120px] xs:max-w-[170px] sm:max-w-xs">
          {title ?? (
            <span className="flex items-center gap-1.5 sm:gap-2 text-slate-400 font-normal">
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-evoly-500 flex-shrink-0" />
              <span className="truncate">EVOLY AI Assistant</span>
            </span>
          )}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* AI Status */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <StatusIcon />
          <span className="hidden sm:inline">
            {aiStatus.status === 'configured'
              ? 'Connected'
              : aiStatus.status === 'loading'
                ? 'Connecting...'
                : 'Disconnected'}
          </span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-surface-border hidden xs:block" />

        {/* Model selector */}
        <div className="relative">
          <button
            onClick={() => setModelOpen(!modelOpen)}
            className={cn(
              'flex items-center gap-1 sm:gap-1.5 text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all',
              'bg-surface-border/40 border border-surface-border',
              'text-slate-400 hover:text-white hover:border-evoly-600/50',
            )}
            aria-label="Select AI model"
            aria-expanded={modelOpen}
          >
            <span className="font-mono truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none text-[11px] sm:text-xs">
              {displayModel}
            </span>
            <ChevronDown className={cn('w-3 h-3 flex-shrink-0 transition-transform', modelOpen && 'rotate-180')} />
          </button>

          {modelOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setModelOpen(false)}
                aria-hidden
              />
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1 z-50 w-[calc(100vw-24px)] sm:w-72 max-w-xs max-h-[70vh] overflow-y-auto bg-surface-card border border-surface-border rounded-xl shadow-xl animate-fade-in custom-scrollbar">
                {MODEL_GROUPS.map((group) => (
                  <div key={group.provider} className="mb-1">
                    <div className="px-4 py-2 sticky top-0 bg-surface-card/95 backdrop-blur-sm z-10 border-y border-surface-border/50 mt-1 first:mt-0 first:border-t-0">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {group.provider}
                      </p>
                    </div>
                    <div className="px-1">
                      {group.models.map((model) => {
                        const isSelected = currentModel === model.id || aiStatus.model === model.id;
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              onModelChange?.(model.id);
                              setModelOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left',
                              isSelected
                                ? 'bg-evoly-600/20 text-evoly-300'
                                : 'text-slate-300 hover:bg-surface-hover hover:text-white',
                            )}
                          >
                            <span className="truncate pr-2 font-mono text-[13px]">{model.label}</span>
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-evoly-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
