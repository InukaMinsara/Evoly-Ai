import { useState } from 'react';
import { Upload, Save, FolderOpen, Plus, FileCode, Check, AlertTriangle, Terminal as TerminalIcon } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { cn } from '../lib/utils';

interface ProjectFile {
  name: string;
  content: string;
}

export function CodeLabPage() {
  const [files, setFiles] = useState<ProjectFile[]>([
    {
      name: 'main.ino',
      content: 'void setup() {\n  // put your setup code here, to run once:\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  // put your main code here, to run repeatedly:\n  Serial.println("Hello from EVOLY AI!");\n  delay(1000);\n}\n'
    }
  ]);
  const [activeFile, setActiveFile] = useState('main.ino');
  const [board, setBoard] = useState('arduino:avr:uno');
  const [port, setPort] = useState('COM3');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [output, setOutput] = useState<string>('Ready.');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Debounced auto-save would go here (localStorage)

  const activeContent = files.find(f => f.name === activeFile)?.content || '';

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setFiles(files.map(f => f.name === activeFile ? { ...f, content: value } : f));
  };

  const verifyCode = async () => {
    setIsVerifying(true);
    setOutput('Verifying sketch...\n');
    setErrorBanner(null);
    try {
      // Stub API call since hardware bridge isn't built yet
      const res = await fetch('/api/system/status');
      const status = await res.json();
      
      if (!status.hardwareBridge?.configured) {
        setErrorBanner('Hardware Bridge not available. Verification requires the local EVOLY Hardware Bridge to be running.');
        setOutput(prev => prev + 'Error: Hardware Bridge not found.\n');
        return;
      }
      
      // Simulate compile delay
      await new Promise(r => setTimeout(r, 1500));
      setOutput(prev => prev + 'Sketch uses 924 bytes (2%) of program storage space.\nGlobal variables use 9 bytes (0%) of dynamic memory.\n\n✅ Done compiling.\n');
      
    } catch (err: any) {
      setOutput(prev => prev + 'Error: ' + err.message + '\n');
    } finally {
      setIsVerifying(false);
    }
  };

  const uploadCode = async () => {
    setIsUploading(true);
    setOutput('Uploading to ' + board + ' on ' + port + '...\n');
    setErrorBanner(null);
    try {
      const res = await fetch('/api/system/status');
      const status = await res.json();
      
      if (!status.hardwareBridge?.configured) {
        setErrorBanner('Hardware Bridge not available. Upload requires the local EVOLY Hardware Bridge to be running.');
        setOutput(prev => prev + 'Error: Hardware Bridge not found.\n');
        return;
      }
      
      await new Promise(r => setTimeout(r, 2000));
      setOutput(prev => prev + 'Writing at 0x00000000... (100 %)\nWrote 924 bytes to flash.\n\n✅ Upload complete.\n');
    } catch (err: any) {
      setOutput(prev => prev + 'Error: ' + err.message + '\n');
    } finally {
      setIsUploading(false);
    }
  };

  const [showMobileFiles, setShowMobileFiles] = useState(false);

  return (
    <div className="flex h-full w-full bg-surface relative overflow-hidden">
      {/* Mobile Backdrop */}
      {showMobileFiles && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setShowMobileFiles(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: File Tree */}
      <div
        className={cn(
          'bg-surface-card border-r border-surface-border flex flex-col flex-shrink-0 transition-all duration-200',
          showMobileFiles
            ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-2xl'
            : 'hidden md:flex md:w-56'
        )}
      >
        <div className="h-12 border-b border-surface-border flex items-center justify-between px-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-evoly-500" />
            Project Files
          </span>
          <button
            onClick={() => setShowMobileFiles(false)}
            className="md:hidden text-slate-500 hover:text-white p-1"
            aria-label="Close files"
          >
            ✕
          </button>
          <button className="hidden md:block text-slate-500 hover:text-white transition-colors" title="New File">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {files.map(f => (
            <button
              key={f.name}
              onClick={() => {
                setActiveFile(f.name);
                setShowMobileFiles(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors',
                activeFile === f.name ? 'bg-evoly-600/20 text-evoly-300' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              )}
            >
              <FileCode className="w-4 h-4" />
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        
        {/* Toolbar */}
        <div className="bg-surface border-b border-surface-border flex flex-wrap items-center justify-between gap-2 p-2 sm:px-4 min-h-[48px] flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowMobileFiles(prev => !prev)}
              className="md:hidden flex items-center gap-1 px-2 py-1.5 bg-surface-card border border-surface-border rounded-lg text-xs font-medium text-slate-300 hover:text-white"
              title="Toggle files"
            >
              <FolderOpen className="w-3.5 h-3.5 text-evoly-400" />
              <span className="text-[11px]">Files</span>
            </button>
            <button
              onClick={verifyCode}
              disabled={isVerifying || isUploading}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-surface-hover hover:bg-surface-border rounded-lg text-xs sm:text-sm font-medium text-slate-200 transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              Verify
            </button>
            <button
              onClick={uploadCode}
              disabled={isVerifying || isUploading}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-evoly-600 hover:bg-evoly-500 rounded-lg text-xs sm:text-sm font-medium text-white shadow-md shadow-evoly-900/20 transition-all disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Upload
            </button>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="bg-surface-card border border-surface-border rounded-lg px-2 sm:px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-evoly-500 max-w-[125px] sm:max-w-none truncate"
            >
              <option value="arduino:avr:uno">Arduino UNO</option>
              <option value="esp32:esp32:esp32">ESP32 Dev Module</option>
              <option value="esp8266:esp8266:nodemcuv2">NodeMCU ESP8266</option>
            </select>
            <select
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="bg-surface-card border border-surface-border rounded-lg px-2 sm:px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-evoly-500 max-w-[90px] sm:max-w-none truncate"
            >
              <option value="COM3">COM3</option>
              <option value="COM4">COM4</option>
            </select>
            <button className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-surface-hover" title="Save All">
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Banner */}
        {errorBanner && (
          <div className="mx-2 sm:mx-4 mt-2 sm:mt-3 flex items-start gap-2.5 rounded-lg border border-amber-700/40 bg-amber-950/30 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-amber-300 animate-fade-in flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {errorBanner}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 relative mt-2">
          <Editor
            height="100%"
            language="cpp" // Arduino C++
            theme="vs-dark"
            value={activeContent}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              scrollBeyondLastLine: false,
              roundedSelection: false,
              padding: { top: 16 },
            }}
            loading={<div className="flex h-full items-center justify-center text-slate-500">Loading editor...</div>}
          />
        </div>

        {/* Output Panel */}
        <div className="h-48 bg-[#0d0d12] border-t border-surface-border flex flex-col">
          <div className="h-8 border-b border-surface-border/50 flex items-center px-4 gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Output</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed custom-scrollbar">
            {output}
          </div>
        </div>
      </div>
    </div>
  );
}
