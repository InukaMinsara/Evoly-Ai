import { useState } from 'react';
import { Search, BookOpen, Download, AlertTriangle, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export function LibraryManagerPage() {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [installed, setInstalled] = useState<any[]>([
    { name: 'Adafruit Unified Sensor', version: '1.1.9', author: 'Adafruit' },
    { name: 'DHT sensor library', version: '1.4.4', author: 'Adafruit' },
  ]);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'installed'>('search');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setIsSearching(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/system/status');
      const status = await res.json();
      if (!status.hardwareBridge?.configured) {
        setErrorBanner('Arduino CLI not available. Library management requires the local Hardware Bridge.');
        setResults([]);
        return;
      }
      
      // Simulate search
      await new Promise(r => setTimeout(r, 1000));
      setResults([
        { name: search, version: '1.0.0', author: 'Community', description: `Library for ${search}` },
        { name: `${search}Master`, version: '2.1.0', author: 'DevTeam', description: `Advanced ${search} implementation` }
      ]);
    } catch (err: any) {
      setErrorBanner('Search failed: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInstall = async (lib: any) => {
    setIsInstalling(lib.name);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/system/status');
      const status = await res.json();
      if (!status.hardwareBridge?.configured) {
        setErrorBanner('Arduino CLI not available. Library installation requires the local Hardware Bridge.');
        return;
      }
      
      await new Promise(r => setTimeout(r, 1500));
      if (!installed.find(i => i.name === lib.name)) {
        setInstalled([...installed, { name: lib.name, version: lib.version, author: lib.author }]);
      }
    } catch (err: any) {
      setErrorBanner('Install failed: ' + err.message);
    } finally {
      setIsInstalling(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      <div className="h-16 px-6 border-b border-surface-border flex items-center justify-between bg-surface-card/50">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-evoly-500" />
          <h1 className="text-lg font-semibold text-slate-200">Library Manager</h1>
        </div>
        <div className="flex bg-surface-border/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", activeTab === 'search' ? "bg-surface-card text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('installed')}
            className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", activeTab === 'installed' ? "bg-surface-card text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
          >
            Installed ({installed.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
        {errorBanner && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-700/40 bg-amber-950/30 px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-sm text-amber-300 leading-relaxed">{errorBanner}</div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Arduino libraries (e.g. Servo, DHT, LiquidCrystal)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface-card border border-surface-border rounded-xl pl-12 pr-24 py-4 text-slate-200 focus:outline-none focus:border-evoly-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={isSearching || !search.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-evoly-600 hover:bg-evoly-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            <div className="space-y-3">
              {results.map((res, i) => {
                const isInst = installed.find(inst => inst.name === res.name);
                return (
                  <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200">{res.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{res.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs bg-surface border border-surface-border px-2 py-1 rounded text-slate-500">v{res.version}</span>
                        <span className="text-xs text-slate-500">by {res.author}</span>
                      </div>
                    </div>
                    {isInst ? (
                      <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                        <Check className="w-4 h-4" /> Installed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInstall(res)}
                        disabled={isInstalling === res.name}
                        className="flex items-center gap-2 px-4 py-2 bg-evoly-600/20 text-evoly-300 hover:bg-evoly-600/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isInstalling === res.name ? (
                          <div className="w-4 h-4 border-2 border-evoly-500 border-t-transparent rounded-full animate-spin" />
                        ) : <Download className="w-4 h-4" />}
                        {isInstalling === res.name ? 'Installing...' : 'Install'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'installed' && (
          <div className="space-y-3">
            {installed.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No libraries installed.</div>
            ) : (
              installed.map((lib, i) => (
                <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 flex items-center justify-between group">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">{lib.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-surface border border-surface-border px-2 py-1 rounded text-slate-500">v{lib.version}</span>
                      <span className="text-xs text-slate-500">by {lib.author}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-sm text-slate-400 hover:text-white transition-colors">
                      Update
                    </button>
                    <button 
                      onClick={() => setInstalled(installed.filter(x => x.name !== lib.name))}
                      className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
