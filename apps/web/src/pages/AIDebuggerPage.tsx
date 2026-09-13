import { useState } from 'react';
import { Bug, Play, Code2, AlertTriangle, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';

export function AIDebuggerPage() {
  const [code, setCode] = useState('// Paste your code here');
  const [buildLog, setBuildLog] = useState('// Paste compiler errors here');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    setIsAnalyzing(true);
    // Simulate AI response since backend debug route isn't fully wired yet
    await new Promise(r => setTimeout(r, 2500));
    setResult({
      problem: "Undeclared variable 'ledPin' used in setup().",
      cause: "You used 'ledPin' on line 4 but forgot to declare it as a global constant or variable at the top of the file.",
      fix: "Add 'const int ledPin = 13;' before the setup() function.",
      oldCode: "// Paste your code here\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}",
      newCode: "// Paste your code here\nconst int ledPin = 13;\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}"
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
      <div className="h-14 px-6 border-b border-surface-border flex items-center justify-between bg-surface-card/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Bug className="w-5 h-5 text-evoly-500" />
          <h1 className="text-sm font-semibold text-slate-200">AI Debugger</h1>
        </div>
        <button
          onClick={analyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-1.5 bg-evoly-600 hover:bg-evoly-500 rounded-lg text-sm font-medium text-white shadow-lg transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          Analyze with AI
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Inputs */}
        <div className="w-1/2 flex flex-col border-r border-surface-border">
          <div className="flex-1 flex flex-col border-b border-surface-border">
            <div className="h-8 bg-surface-card border-b border-surface-border flex items-center px-3 gap-2">
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] uppercase font-semibold text-slate-400">Source Code</span>
            </div>
            <div className="flex-1 relative">
              <Editor
                language="cpp"
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{ minimap: { enabled: false }, fontSize: 13 }}
              />
            </div>
          </div>
          <div className="h-48 flex flex-col">
            <div className="h-8 bg-surface-card border-y border-surface-border flex items-center px-3 gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] uppercase font-semibold text-slate-400">Compiler Logs</span>
            </div>
            <textarea
              className="flex-1 bg-[#0d0d12] p-3 text-xs font-mono text-red-400 resize-none outline-none custom-scrollbar"
              value={buildLog}
              onChange={e => setBuildLog(e.target.value)}
            />
          </div>
        </div>

        {/* Right Output */}
        <div className="w-1/2 flex flex-col bg-surface-card/30 overflow-y-auto custom-scrollbar">
          {result ? (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="bg-surface border border-surface-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> The Problem
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{result.problem}</p>
                <div className="mt-3 p-3 bg-surface-card rounded-lg text-sm text-slate-400">
                  <span className="font-semibold text-slate-300">Cause: </span>{result.cause}
                </div>
              </div>

              <div className="bg-surface border border-emerald-500/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" /> The Fix
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{result.fix}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Suggested Code</h3>
                <div className="border border-surface-border rounded-xl overflow-hidden h-64 relative">
                  <Editor
                    language="cpp"
                    theme="vs-dark"
                    value={result.newCode}
                    options={{ readOnly: true, minimap: { enabled: false } }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
              <Bug className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-slate-400">Paste your code and errors on the left, then click Analyze to find the bug.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
