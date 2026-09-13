import { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  MousePointer,
  Eye,
  Percent,
  Hash,
  Loader2,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export function SearchConsolePage() {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<'7d' | '28d' | '90d'>('28d');
  const [activeDimension, setActiveDimension] = useState<'query' | 'page'>('query');

  const [queryRows, setQueryRows] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      fetchPerformance();
    }
  }, [selectedSite, dateRange, activeDimension]);

  const fetchSites = async () => {
    setLoadingSites(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/api/search-console/sites');
      const data = await res.json();
      if (res.ok && data.success) {
        setSites(data.sites || []);
        if (data.sites?.length > 0) {
          setSelectedSite(data.sites[0].siteUrl);
        }
      } else {
        setError(data.error || 'Google Search Console not connected.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSites(false);
    }
  };

  const fetchPerformance = async () => {
    if (!selectedSite) return;
    setLoadingData(true);

    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '28d' ? 28 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    try {
      const res = await fetch('http://localhost:3000/api/search-console/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: selectedSite,
          startDate,
          endDate,
          dimensions: [activeDimension],
          rowLimit: 25,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQueryRows(data.rows || []);
      }
    } catch (e) {}
    setLoadingData(false);
  };

  // Compute summary totals
  const totalClicks = queryRows.reduce((acc, r) => acc + (r.clicks || 0), 0);
  const totalImpressions = queryRows.reduce((acc, r) => acc + (r.impressions || 0), 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition =
    queryRows.length > 0
      ? queryRows.reduce((acc, r) => acc + (r.position || 0), 0) / queryRows.length
      : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-y-auto">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 sm:gap-3">
            <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 flex-shrink-0" />
            <span>Search Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real organic search performance, impressions, click-through rate, and search query rankings.
          </p>
        </div>

        {/* OAuth Connect Action */}
        <div className="w-full sm:w-auto">
          {sites.length > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Connected ({sites.length} {sites.length === 1 ? 'property' : 'properties'})
            </div>
          ) : (
            <a
              href="http://localhost:3000/api/oauth/google/search-console/start"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all w-full sm:w-auto"
            >
              <Globe className="w-4 h-4" />
              Connect Search Console
            </a>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6 sm:space-y-8">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-card border border-surface-border rounded-2xl p-4">
          {/* Site Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">Web Property:</span>
            {loadingSites ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : sites.length > 0 ? (
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="bg-surface border border-surface-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {sites.map((s, idx) => (
                  <option key={idx} value={s.siteUrl}>
                    {s.siteUrl}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-500 italic">{error || 'No verified properties'}</span>
            )}
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Date:
            </span>
            {(['7d', '28d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  dateRange === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-surface border border-surface-border text-slate-400 hover:text-white'
                }`}
              >
                {r === '7d' ? 'Last 7 days' : r === '28d' ? 'Last 28 days' : 'Last 3 months'}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Total Clicks</span>
              <MousePointer className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</h3>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Total Impressions</span>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{totalImpressions.toLocaleString()}</h3>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Average CTR</span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{avgCtr.toFixed(2)}%</h3>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Average Position</span>
              <Hash className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{avgPosition > 0 ? avgPosition.toFixed(1) : '—'}</h3>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveDimension('query')}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                  activeDimension === 'query'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Top Queries
              </button>
              <button
                onClick={() => setActiveDimension('page')}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                  activeDimension === 'page'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Top Pages
              </button>
            </div>
            {loadingData && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
          </div>

          {queryRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-border text-slate-400">
                    <th className="pb-3 font-medium">{activeDimension === 'query' ? 'Search Query' : 'Target Page'}</th>
                    <th className="pb-3 font-medium text-right">Clicks</th>
                    <th className="pb-3 font-medium text-right">Impressions</th>
                    <th className="pb-3 font-medium text-right">CTR</th>
                    <th className="pb-3 font-medium text-right">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-slate-200">
                  {queryRows.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-hover">
                      <td className="py-3 font-mono text-slate-300 max-w-md truncate">{row.keys?.[0] || '—'}</td>
                      <td className="py-3 text-right font-medium text-white">{row.clicks.toLocaleString()}</td>
                      <td className="py-3 text-right text-slate-400">{row.impressions.toLocaleString()}</td>
                      <td className="py-3 text-right text-emerald-400">{(row.ctr * 100).toFixed(1)}%</td>
                      <td className="py-3 text-right text-amber-400">{row.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No search queries recorded for this property in the selected date range.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SearchConsolePage;
