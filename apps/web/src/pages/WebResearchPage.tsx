import { useState } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Layers,
  Filter,
} from 'lucide-react';

export function WebResearchPage() {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<'standard' | 'deep'>('standard');
  const [provider, setProvider] = useState<string>('auto');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [usedProvider, setUsedProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      if (depth === 'deep') {
        const res = await fetch('http://localhost:3000/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: query, depth: 'deep' }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Deep research failed');
        setResults(data.sources || []);
        setUsedProvider('Multi-Source Synthesis');
      } else {
        const res = await fetch('http://localhost:3000/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            provider: provider === 'auto' ? undefined : provider,
            limit: 8,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Search failed');
        setResults(data.results || []);
        setUsedProvider(data.provider);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-y-auto">
      {/* Header */}
      <header className="px-8 py-6 border-b border-surface-border">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-evoly-400" />
          Web Research & Technical Intelligence
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Multi-provider neural and keyword search across Google, Tavily, Exa, Serper, and Jina with automated fallback.
        </p>
      </header>

      <main className="flex-1 p-8 max-w-5xl w-full mx-auto space-y-8">
        {/* Search Controls */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search datasheets, kinematics equations, robotics papers, or circuit diagrams..."
              className="flex-1 bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-evoly-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-evoly-600 hover:bg-evoly-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-evoly-600/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Research
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-surface-border">
            {/* Provider selection */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">Provider:</span>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="bg-surface border border-surface-border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="auto">Auto-Fallback Router (Recommended)</option>
                <option value="tavily">Tavily AI Search</option>
                <option value="exa">Exa Neural Search</option>
                <option value="serper">Serper (Google)</option>
                <option value="google">Google Custom Search</option>
                <option value="jina">Jina AI Reader</option>
                <option value="firecrawl">Firecrawl Deep Search</option>
                <option value="bing">Bing Search</option>
                <option value="you">You.com</option>
              </select>
            </div>

            {/* Depth selection */}
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">Depth:</span>
              <div className="flex bg-surface rounded-lg p-0.5 border border-surface-border">
                <button
                  onClick={() => setDepth('standard')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    depth === 'standard' ? 'bg-evoly-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setDepth('deep')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    depth === 'deep' ? 'bg-evoly-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Deep Research
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status / Provider Info */}
        {usedProvider && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>
              Executed via: <strong className="text-white capitalize">{usedProvider}</strong>
            </span>
            <span>{results.length} results returned</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((res, i) => (
              <div key={i} className="bg-surface-card border border-surface-border rounded-2xl p-6 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-hover text-slate-300 font-mono border border-surface-border mr-2">
                      {res.source}
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-evoly-400 hover:text-evoly-300 hover:underline inline-flex items-center gap-1.5"
                    >
                      {res.title}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(res.url);
                      setCopiedUrl(res.url);
                      setTimeout(() => setCopiedUrl(null), 2000);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-surface-hover"
                  >
                    {copiedUrl === res.url ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-mono mb-3 truncate">{res.url}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{res.snippet}</p>

                {res.content && (
                  <div className="mt-4 p-3 rounded-xl bg-surface border border-surface-border text-xs text-slate-400 font-mono max-h-40 overflow-y-auto">
                    {res.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default WebResearchPage;
