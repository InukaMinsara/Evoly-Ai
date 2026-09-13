import { useState, useEffect } from 'react';
import { Search, CircuitBoard, Check, Download, Trash2, AlertTriangle } from 'lucide-react';

const KNOWN_BOARDS = [
  { id: 'arduino:avr:uno', name: 'Arduino UNO', core: 'arduino:avr', status: 'available', fqbn: 'arduino:avr:uno' },
  { id: 'arduino:avr:nano', name: 'Arduino Nano', core: 'arduino:avr', status: 'available', fqbn: 'arduino:avr:nano' },
  { id: 'arduino:avr:mega', name: 'Arduino Mega 2560', core: 'arduino:avr', status: 'available', fqbn: 'arduino:avr:mega2560' },
  { id: 'arduino:avr:leonardo', name: 'Arduino Leonardo', core: 'arduino:avr', status: 'available', fqbn: 'arduino:avr:leonardo' },
  { id: 'arduino:avr:micro', name: 'Arduino Micro', core: 'arduino:avr', status: 'available', fqbn: 'arduino:avr:micro' },
  { id: 'esp32:esp32:esp32', name: 'ESP32 Dev Module', core: 'esp32:esp32', status: 'available', fqbn: 'esp32:esp32:esp32' },
  { id: 'esp32:esp32:esp32s3', name: 'ESP32-S3', core: 'esp32:esp32', status: 'available', fqbn: 'esp32:esp32:esp32s3' },
  { id: 'esp32:esp32:esp32c3', name: 'ESP32-C3', core: 'esp32:esp32', status: 'available', fqbn: 'esp32:esp32:esp32c3' },
  { id: 'esp8266:esp8266:nodemcuv2', name: 'NodeMCU 1.0 (ESP-12E)', core: 'esp8266:esp8266', status: 'available', fqbn: 'esp8266:esp8266:nodemcuv2' },
  { id: 'rp2040:rp2040:rpipico', name: 'Raspberry Pi Pico', core: 'rp2040:rp2040', status: 'available', fqbn: 'rp2040:rp2040:rpipico' },
];

export function BoardManagerPage() {
  const [search, setSearch] = useState('');
  const [installed, setInstalled] = useState<string[]>([]);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('evoly_installed_boards');
    if (saved) {
      try { setInstalled(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveInstalled = (newInstalled: string[]) => {
    setInstalled(newInstalled);
    localStorage.setItem('evoly_installed_boards', JSON.stringify(newInstalled));
  };

  const handleInstall = async (fqbn: string) => {
    setIsInstalling(fqbn);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/system/status');
      const status = await res.json();
      if (!status.hardwareBridge?.configured) {
        setErrorBanner('Arduino CLI not available. Board installation requires the local Hardware Bridge.');
        return;
      }
      
      // Simulate installation
      await new Promise(r => setTimeout(r, 2000));
      saveInstalled([...installed, fqbn]);
    } catch (err: any) {
      setErrorBanner('Failed to install: ' + err.message);
    } finally {
      setIsInstalling(null);
    }
  };

  const handleRemove = (fqbn: string) => {
    saveInstalled(installed.filter(id => id !== fqbn));
  };

  const filtered = KNOWN_BOARDS.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.core.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      <div className="h-16 px-6 border-b border-surface-border flex items-center justify-between bg-surface-card/50">
        <div className="flex items-center gap-3">
          <CircuitBoard className="w-5 h-5 text-evoly-500" />
          <h1 className="text-lg font-semibold text-slate-200">Board Manager</h1>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search boards..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-evoly-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {errorBanner && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-700/40 bg-amber-950/30 px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-sm text-amber-300 leading-relaxed">{errorBanner}</div>
          </div>
        )}

        {/* Installed */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Installed Boards</h2>
          {installed.length === 0 ? (
            <div className="text-sm text-slate-500 italic px-4">No boards installed yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {KNOWN_BOARDS.filter(b => installed.includes(b.fqbn)).map(board => (
                <div key={board.id} className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col gap-3 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-200">{board.name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-1">{board.fqbn}</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded-md font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Installed
                    </span>
                  </div>
                  <div className="mt-auto pt-3 border-t border-surface-border/50 flex justify-between items-center">
                    <span className="text-xs text-slate-400">{board.core}</span>
                    <button
                      onClick={() => handleRemove(board.fqbn)}
                      className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Available Boards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.filter(b => !installed.includes(b.fqbn)).map(board => (
              <div key={board.id} className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col gap-3">
                <div>
                  <h3 className="font-semibold text-slate-200">{board.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">{board.fqbn}</p>
                </div>
                <div className="mt-auto pt-3 border-t border-surface-border/50 flex justify-between items-center">
                  <span className="text-xs text-slate-400">{board.core}</span>
                  <button
                    onClick={() => handleInstall(board.fqbn)}
                    disabled={isInstalling === board.fqbn}
                    className="text-xs bg-evoly-600/20 text-evoly-300 hover:bg-evoly-600/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isInstalling === board.fqbn ? (
                      <span className="w-3 h-3 border-2 border-evoly-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    {isInstalling === board.fqbn ? 'Installing...' : 'Install'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
