import { useState } from 'react';
import { Terminal, Play, Square, Trash2, Send, Download, Settings2 } from 'lucide-react';

export function SerialMonitorPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [port, setPort] = useState('COM3');
  const [baud, setBaud] = useState('115200');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [autoscroll, setAutoscroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);

  const toggleConnect = () => {
    if (isConnected) {
      setIsConnected(false);
      setOutput(prev => [...prev, `\n[Disconnected from ${port}]`]);
    } else {
      setIsConnected(true);
      setOutput(prev => [...prev, `\n[Connected to ${port} @ ${baud} baud]`]);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !isConnected) return;
    
    const timestamp = showTimestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    setOutput(prev => [...prev, `${timestamp}-> ${input}`]);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
      {/* Header Toolbar */}
      <div className="min-h-14 px-3 sm:px-4 py-2 sm:py-0 border-b border-surface-border flex flex-wrap items-center justify-between gap-2 bg-surface-card/50 flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-evoly-500 flex-shrink-0" />
          <h1 className="text-xs sm:text-sm font-semibold text-slate-200">Serial Monitor</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <select 
            disabled={isConnected}
            value={port}
            onChange={e => setPort(e.target.value)}
            className="bg-surface border border-surface-border rounded-lg px-2 sm:px-3 py-1.5 text-xs text-slate-300 disabled:opacity-50 max-w-[120px] sm:max-w-none truncate"
          >
            <option value="COM3">COM3</option>
            <option value="COM4">COM4</option>
          </select>
          
          <select 
            disabled={isConnected}
            value={baud}
            onChange={e => setBaud(e.target.value)}
            className="bg-surface border border-surface-border rounded-lg px-2 sm:px-3 py-1.5 text-xs text-slate-300 disabled:opacity-50 max-w-[105px] sm:max-w-none truncate"
          >
            <option value="9600">9600 baud</option>
            <option value="115200">115200 baud</option>
          </select>

          <button
            onClick={toggleConnect}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isConnected 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {isConnected ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Terminal Area */}
      <div className="flex-1 bg-[#0d0d12] p-4 font-mono text-[13px] text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed custom-scrollbar">
        {output.length === 0 ? (
          <div className="text-slate-600 italic">Not connected. Select a port and click Connect to start reading serial data.</div>
        ) : (
          output.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>

      {/* Bottom Input & Controls */}
      <div className="h-14 px-4 border-t border-surface-border bg-surface-card/50 flex items-center gap-3 flex-shrink-0">
        <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            disabled={!isConnected}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Send message..."
            className="flex-1 bg-surface border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-evoly-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isConnected || !input}
            className="p-1.5 rounded-lg bg-evoly-600 text-white disabled:opacity-50 hover:bg-evoly-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        
        <div className="w-px h-6 bg-surface-border mx-2" />
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setOutput([])}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-hover" 
            title="Clear Output"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-hover" 
            title="Export Logs"
          >
            <Download className="w-4 h-4" />
          </button>
          <div className="relative group">
            <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-hover">
              <Settings2 className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-surface-card border border-surface-border rounded-lg p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <label className="flex items-center gap-2 text-xs text-slate-300 p-1">
                <input type="checkbox" checked={autoscroll} onChange={e => setAutoscroll(e.target.checked)} />
                Autoscroll
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 p-1">
                <input type="checkbox" checked={showTimestamps} onChange={e => setShowTimestamps(e.target.checked)} />
                Show timestamps
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
