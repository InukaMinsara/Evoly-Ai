import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  FolderOpen,
  Code2,
  Image,
  Globe,
  AlertCircle,
  Loader2,
  Zap,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SystemStatus {
  [key: string]: { configured: boolean } | undefined;
}

interface QuickAction {
  label: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  to: string;
  accent: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'New Chat',
    description: 'Start a conversation with the AI assistant',
    icon: MessageSquare,
    to: '/ai',
    accent: 'from-evoly-600/20 to-evoly-700/10 border-evoly-600/30 hover:border-evoly-500/60',
  },
  {
    label: 'New Project',
    description: 'Create a new robotics project',
    icon: FolderOpen,
    to: '/projects',
    accent: 'from-blue-600/20 to-blue-700/10 border-blue-600/30 hover:border-blue-500/60',
  },
  {
    label: 'Open Code Lab',
    description: 'Write and flash firmware',
    icon: Code2,
    to: '/code',
    accent: 'from-emerald-600/20 to-emerald-700/10 border-emerald-600/30 hover:border-emerald-500/60',
  },
  {
    label: 'Media Studio',
    description: 'NVIDIA Image, Kaggle Video & Voice',
    icon: Image,
    to: '/media',
    accent: 'from-purple-600/20 to-purple-700/10 border-purple-600/30 hover:border-purple-500/60',
  },
  {
    label: 'Web Research',
    description: 'Multi-provider intelligence search',
    icon: Globe,
    to: '/research',
    accent: 'from-cyan-600/20 to-cyan-700/10 border-cyan-600/30 hover:border-cyan-500/60',
  },
];

const INTEGRATION_LABELS: Record<string, string> = {
  groq:           'Groq AI (Primary)',
  gemini:         'Gemini AI',
  openai:         'OpenAI',
  anthropic:      'Anthropic Claude',
  nvidiaNim:      'NVIDIA NIM (Visual Gen)',
  kaggle:         'Kaggle Video Workflow',
  googleSearch:   'Google Search',
  tavily:         'Tavily Search',
  exa:            'Exa Neural Search',
  serper:         'Serper Google',
  jina:           'Jina AI Reader',
  firecrawl:      'Firecrawl Search',
  elevenlabs:     'ElevenLabs Voice',
  deepgram:       'Deepgram Voice',
  e2b:            'E2B Code Sandbox',
  places:         'Google Places',
  googleOAuth:    'Google OAuth',
  youtubeApi:     'YouTube Data API',
  githubOAuth:    'GitHub OAuth',
  wokwi:          'Wokwi Simulator',
  hardwareBridge: 'Hardware Bridge',
  supabase:       'Supabase Database',
};

// ─────────────────────────────────────────────
// DashboardPage
// ─────────────────────────────────────────────

export default function DashboardPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setStatusLoading(true);
    setStatusError(null);
    const endpoints = [
      '/api/system/status',
      'http://127.0.0.1:3000/api/system/status',
      'http://localhost:3000/api/system/status',
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as SystemStatus;
          setSystemStatus(data);
          setStatusError(null);
          setStatusLoading(false);
          return;
        }
      } catch {
        // Try next fallback endpoint
      }
    }

    setStatusError('Could not reach API server at http://localhost:3000');
    setStatusLoading(false);
  };

  useEffect(() => {
    document.title = 'EvolyAI — AI Robotics Engineering Platform';
    void fetchStatus();
  }, []);

  const configuredCount = systemStatus
    ? Object.values(systemStatus).filter((item) => item?.configured).length
    : 0;
  const totalCount = systemStatus
    ? Object.keys(systemStatus).length
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center shadow-lg shadow-evoly-600/20">
                <span className="text-[11px] font-bold text-white select-none">EV</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  EVOLY <span className="text-evoly-400">AI</span>
                </h1>
                <p className="text-xs text-slate-500">Engineering Platform</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Good{' '}
              {new Date().getHours() < 12
                ? 'morning'
                : new Date().getHours() < 17
                  ? 'afternoon'
                  : 'evening'}
              . What are we building today?
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Activity className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className={cn(
                    'group flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br transition-all duration-150',
                    'hover:shadow-lg hover:-translate-y-0.5',
                    action.accent,
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-card/60 border border-surface-border flex items-center justify-center group-hover:border-surface-hover transition-colors">
                    <Icon className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-tight">{action.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity */}
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Recent Activity
            </h2>
            <div className="bg-surface-card border border-surface-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[180px]">
              <div className="w-10 h-10 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center mb-3">
                <Activity className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-400">No recent activity</p>
              <p className="text-xs text-slate-600 mt-1">Your recent work will appear here</p>
            </div>
          </section>

          {/* System Status */}
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              System Status
              {!statusLoading && systemStatus && (
                <span className="text-[10px] normal-case font-normal text-slate-600">
                  {configuredCount}/{totalCount} configured
                </span>
              )}
            </h2>

            <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
              {statusLoading && (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Checking integrations…</span>
                </div>
              )}

              {statusError && !statusLoading && (
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-400 font-medium">API server unreachable</p>
                      <p className="text-xs text-slate-500 mt-0.5">{statusError}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => void fetchStatus()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-surface-hover hover:bg-surface-hover/80 border border-surface-border rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </div>
              )}

              {systemStatus && !statusLoading && (
                <div className="divide-y divide-surface-border">
                  {Object.entries(systemStatus).map(([key, value]) => {
                    const isConfigured = Boolean(value?.configured);
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-hover/40 transition-colors"
                      >
                        <span className="text-xs text-slate-300">
                          {INTEGRATION_LABELS[key] ?? key}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isConfigured ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                              <span className="text-[11px] text-green-400">Configured</span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span className="text-[11px] text-amber-400">Not configured</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Footer / Legal Section ── */}
        <footer className="mt-12 pt-8 pb-12 border-t border-surface-border" aria-label="Footer">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center shadow-md shadow-evoly-600/20">
                <span className="text-[9px] font-bold text-white select-none">EV</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-300">EVOLY AI</span>
                <span className="text-[11px] text-slate-500">
                  AI-Powered Robotics Engineering Platform
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <Link
                to="/privacy"
                className="text-slate-300 hover:text-evoly-400 transition-colors font-medium underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-slate-300 hover:text-evoly-400 transition-colors font-medium underline-offset-4 hover:underline"
              >
                Terms of Service
              </Link>
              <Link
                to="/settings"
                className="hover:text-slate-200 transition-colors"
              >
                Settings
              </Link>
              <a
                href="https://github.com/InukaMinsara/Evoly-Ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-200 transition-colors"
              >
                GitHub
              </a>
              <a
                href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'immaster2024@gmail.com'}`}
                className="hover:text-slate-200 transition-colors"
              >
                Contact
              </a>
            </div>

            <p className="text-[11px] text-slate-600 text-center md:text-right">
              &copy; {new Date().getFullYear()} EvolyAI. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
