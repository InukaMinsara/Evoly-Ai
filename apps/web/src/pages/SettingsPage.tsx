import { useState, useEffect } from 'react';
import { Settings, Server, Key, Plug, Github, Youtube, Database, Search, HardDrive, LayoutTemplate, Palette } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('developer');
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/system/status')
      .then(r => r.json())
      .then(data => setStatus(data.integrations))
      .catch(() => {});
  }, []);

  const TABS = [
    { id: 'account', label: 'Account', icon: LayoutTemplate },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'developer', label: 'Developer & Integrations', icon: Plug },
    { id: 'local', label: 'Local Tools', icon: HardDrive },
  ];

  const renderStatusBadge = (configured: boolean) => (
    <span className={cn(
      "text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded flex items-center gap-1.5 w-fit",
      configured ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400 border border-surface-border"
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", configured ? "bg-emerald-400" : "bg-slate-500")} />
      {configured ? "Configured" : "Not Configured"}
    </span>
  );

  return (
    <div className="flex h-full w-full bg-surface">
      {/* Sidebar */}
      <div className="w-64 bg-surface-card border-r border-surface-border flex flex-col">
        <div className="h-16 border-b border-surface-border flex items-center px-6">
          <Settings className="w-5 h-5 text-evoly-500 mr-3" />
          <h1 className="text-lg font-semibold text-slate-200">Settings</h1>
        </div>
        <div className="p-3 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  activeTab === tab.id ? "bg-evoly-600/20 text-evoly-400 font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-surface-hover"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {activeTab === 'developer' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-200 mb-1">Developer Integrations</h2>
                <p className="text-sm text-slate-400">Manage API keys and external services connected to EVOLY AI. Edit these in your <code>.env</code> file.</p>
              </div>

              {status ? (
                <div className="space-y-4">
                  {/* AI Providers */}
                  <div className="bg-surface-card border border-surface-border rounded-xl p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-evoly-400"/> AI Models</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Groq (Primary)</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">GROQ_API_KEY</p>
                        </div>
                        {renderStatusBadge(status.groq?.configured)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Gemini</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">GEMINI_API_KEY</p>
                        </div>
                        {renderStatusBadge(status.gemini?.configured)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300 font-medium">NVIDIA NIM (Image Gen)</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">NVIDIA_API_KEY</p>
                        </div>
                        {renderStatusBadge(status.nvidiaNim?.configured)}
                      </div>
                    </div>
                  </div>

                  {/* Google Services */}
                  <div className="bg-surface-card border border-surface-border rounded-xl p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Search className="w-4 h-4 text-blue-400"/> Google Services</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Google Custom Search</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">GOOGLE_SEARCH_API_KEY</p>
                        </div>
                        {renderStatusBadge(status.googleSearch?.configured)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Google Places</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">GOOGLE_MAPS_API_KEY</p>
                        </div>
                        {renderStatusBadge(status.places?.configured)}
                      </div>
                    </div>
                  </div>

                  {/* OAuth */}
                  <div className="bg-surface-card border border-surface-border rounded-xl p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-purple-400"/> OAuth Integrations</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300 font-medium flex items-center gap-1.5"><Github className="w-4 h-4"/> GitHub OAuth</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET</p>
                        </div>
                        {renderStatusBadge(status.githubOAuth?.configured ?? status.github?.configured)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300 font-medium flex items-center gap-1.5"><Youtube className="w-4 h-4 text-red-400"/> YouTube Data API</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">YOUTUBE_API_KEY</p>
                        </div>
                        {renderStatusBadge(status.youtubeApi?.configured ?? status.youtube?.configured)}
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="bg-surface-card border border-surface-border rounded-xl p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400"/> External Services</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Supabase Database</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">SUPABASE_URL</p>
                        </div>
                        {renderStatusBadge(status.supabase?.configured)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Wokwi Simulator CLI</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">WOKWI_CLI_TOKEN</p>
                        </div>
                        {renderStatusBadge(status.wokwi?.configured)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">Loading status...</div>
              )}
            </div>
          )}

          {activeTab === 'local' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-200 mb-1">Local Tools</h2>
                <p className="text-sm text-slate-400">Manage connections to local machine services.</p>
              </div>
              <div className="bg-surface-card border border-surface-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">EVOLY Hardware Bridge</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-md">Required for compiling, uploading, and reading serial data from real Arduino/ESP boards.</p>
                  </div>
                  {renderStatusBadge(status?.hardwareBridge?.configured)}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'account' || activeTab === 'appearance') && (
            <div className="animate-fade-in p-8 text-center border border-dashed border-surface-border rounded-xl">
              <p className="text-slate-500">This section is under construction.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
