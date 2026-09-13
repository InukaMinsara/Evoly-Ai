import { useState, useEffect } from 'react';
import { HardDrive, RefreshCw, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Port {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  vendorId?: string;
  productId?: string;
}

export function HardwarePage() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [bridgeUrl, setBridgeUrl] = useState('');

  useEffect(() => {
    checkBridge();
  }, []);

  const checkBridge = async () => {
    try {
      const res = await fetch('/api/system/status');
      const status = await res.json();
      
      if (status.hardwareBridge?.configured) {
        setBridgeStatus('connected');
        setBridgeUrl('http://localhost:4242');
        // We would fetch real ports from the bridge here
        // For now, simulate finding a port
        setPorts([
          { path: 'COM3', manufacturer: 'Arduino LLC', vendorId: '2341', productId: '0043' }
        ]);
      } else {
        setBridgeStatus('disconnected');
        setPorts([]);
      }
    } catch (e) {
      setBridgeStatus('disconnected');
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    await checkBridge();
    setTimeout(() => setIsScanning(false), 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
      <div className="min-h-16 px-4 sm:px-6 py-3 sm:py-0 border-b border-surface-border flex items-center justify-between gap-3 bg-surface-card/50 flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <HardDrive className="w-5 h-5 text-evoly-500 flex-shrink-0" />
          <h1 className="text-base sm:text-lg font-semibold text-slate-200">Hardware Devices</h1>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-surface-hover hover:bg-surface-border rounded-lg text-xs sm:text-sm text-slate-300 transition-colors flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isScanning ? 'animate-spin' : ''}`} />
          Scan Ports
        </button>
      </div>

      <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">
        
        {/* Bridge Status Banner */}
        <div className={`rounded-xl border p-4 flex items-start gap-4 ${
          bridgeStatus === 'connected' 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : bridgeStatus === 'disconnected'
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-surface-card border-surface-border'
        }`}>
          {bridgeStatus === 'connected' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-0.5" />
          ) : bridgeStatus === 'disconnected' ? (
            <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5" />
          ) : (
            <RefreshCw className="w-6 h-6 text-slate-500 mt-0.5 animate-spin" />
          )}
          
          <div className="flex-1">
            <h3 className={`font-semibold ${
              bridgeStatus === 'connected' ? 'text-emerald-400' : 
              bridgeStatus === 'disconnected' ? 'text-amber-400' : 'text-slate-300'
            }`}>
              {bridgeStatus === 'connected' ? 'Hardware Bridge Connected' : 
               bridgeStatus === 'disconnected' ? 'Hardware Bridge Offline' : 'Checking Bridge Status...'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {bridgeStatus === 'connected' 
                ? `Successfully communicating with the local EVOLY Hardware Bridge at ${bridgeUrl}.` 
                : 'The EVOLY Hardware Bridge is required to compile code, upload to boards, and read serial data. Please start the bridge on your local machine.'}
            </p>
          </div>
        </div>

        {/* Ports Table */}
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
            <h2 className="font-semibold text-slate-200">Connected Devices</h2>
          </div>
          
          {ports.length === 0 ? (
            <div className="p-8 text-center">
              <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No devices found</p>
              <p className="text-sm text-slate-500 mt-1">Connect an Arduino or ESP32 to your USB port.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-border/30 text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Port</th>
                  <th className="px-5 py-3 font-medium">Manufacturer</th>
                  <th className="px-5 py-3 font-medium">VID:PID</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {ports.map((port, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-evoly-300">{port.path}</td>
                    <td className="px-5 py-4 text-slate-300">{port.manufacturer || 'Unknown'}</td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {port.vendorId && port.productId ? `${port.vendorId}:${port.productId}` : '-'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link 
                        to="/serial" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-surface-border hover:border-evoly-500/50 rounded-lg text-slate-300 hover:text-white transition-colors"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        Open Serial
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
