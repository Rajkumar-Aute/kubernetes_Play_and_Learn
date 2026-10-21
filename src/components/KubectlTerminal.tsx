import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, HelpCircle, Sparkles } from 'lucide-react';
import type { GameState } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface KubectlTerminalProps {
  state: GameState;
  onExecuteCommand: (cmd: string) => void;
  onClearTerminal: () => void;
}

export const KubectlTerminal: React.FC<KubectlTerminalProps> = ({
  state,
  onExecuteCommand,
  onClearTerminal
}) => {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Contextual command suggestions based on current mission
  const getMissionCommandChips = () => {
    switch (state.currentLevelId) {
      case 1:
        return [
          'kubectl scale deployment web --replicas=1',
          'kubectl get pods',
          'kubectl get nodes',
          'kubectl get svc'
        ];
      case 2:
        return [
          'kubectl scale deployment web --replicas=3',
          'kubectl get pods',
          'kubectl get deploy',
          'kubectl get nodes'
        ];
      case 3:
        return [
          'kubectl apply -f service.yaml',
          'kubectl get svc',
          'kubectl describe svc web-service',
          'kubectl get pods'
        ];
      case 4:
        return [
          'kubectl logs backend-78b-crash',
          'kubectl describe pod backend-78b-crash',
          'kubectl set env deployment backend DB_HOST=postgres-cluster',
          'kubectl get pods'
        ];
      case 5:
        return [
          'kubectl set resources deployment web --limits=memory=256Mi',
          'kubectl describe pod web-crunch-1',
          'kubectl get pods'
        ];
      case 6:
        return [
          'kubectl set image deployment web web=web-app:2.0',
          'kubectl rollout status deployment web',
          'kubectl get pods'
        ];
      case 7:
        return [
          'kubectl get nodes',
          'kubectl get pods -o wide',
          'kubectl describe node worker-node-2'
        ];
      case 8:
        return [
          'kubectl autoscale deployment web --min=2 --max=7 --cpu-percent=60',
          'kubectl get hpa',
          'kubectl get pods'
        ];
      default:
        return [
          'kubectl get pods',
          'kubectl get nodes',
          'kubectl get svc',
          'kubectl scale deployment web --replicas=3'
        ];
    }
  };

  const commandChips = getMissionCommandChips();

  // Auto-scroll to bottom whenever new command output is added
  useEffect(() => {
    const scrollToBottom = () => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 60);
    return () => clearTimeout(timer);
  }, [state.terminalHistory]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    soundEngine.playClick();
    onExecuteCommand(trimmed);
    setInputVal('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const userCommands = state.terminalHistory
      .filter((h) => h.type === 'cmd')
      .map((h) => h.text.replace('$', '').trim());

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (userCommands.length === 0) return;
      const nextIdx = historyIndex + 1 < userCommands.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setInputVal(userCommands[userCommands.length - 1 - nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(userCommands[userCommands.length - 1 - nextIdx] || '');
      } else {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-full w-full min-h-0 shadow-2xl overflow-hidden font-mono">
      {/* 1. Terminal Window Header (Git Bash / Linux Style) */}
      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-2">
          {/* macOS / Git Bash window buttons */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">bash: kubectl@k8s-prod</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              onExecuteCommand('kubectl help');
            }}
            title="Kubectl help"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClearTerminal();
            }}
            title="Clear terminal screen"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. TOP TOOLBAR: Suggestions directly beneath title bar */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-1.5 shrink-0 select-none">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-cyan-400 uppercase font-black tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Suggested Commands:
          </span>
          <span className="text-[9px] text-slate-500 font-sans">
            Click to run in terminal
          </span>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 max-h-[70px] overflow-y-auto no-scrollbar">
          {commandChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundEngine.playClick();
                onExecuteCommand(chip);
              }}
              title={`Execute: ${chip}`}
              className="text-[10px] bg-slate-800 hover:bg-cyan-950 text-sky-300 hover:text-cyan-200 hover:border-cyan-500/80 px-2.5 py-0.5 rounded border border-slate-700 transition font-mono font-medium shadow-sm active:scale-95 text-left"
            >
              {chip.replace('kubectl ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Terminal Console Output Screen (Middle, flexible scroll area) */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 p-3 overflow-y-auto space-y-2 text-xs select-text leading-relaxed bg-slate-950 font-mono scroll-smooth"
      >
        <div className="text-slate-500 text-[11px] mb-2 border-b border-slate-900 pb-1">
          KubeDefender Cluster Shell. Type commands or tap suggestions above. Scroll up to view history.
        </div>

        {state.terminalHistory.map((item, index) => {
          let colorClass = 'text-slate-300';
          if (item.type === 'cmd') colorClass = 'text-cyan-400 font-bold border-l-2 border-cyan-500 pl-2 mt-2';
          if (item.type === 'error') colorClass = 'text-rose-400 font-semibold';
          if (item.type === 'success') colorClass = 'text-emerald-400 font-semibold';

          return (
            <div key={index} className={`whitespace-pre-wrap break-all ${colorClass}`}>
              {item.text}
            </div>
          );
        })}

        {/* Dummy bottom anchor for auto-scrolling */}
        <div ref={bottomRef} className="h-1 shrink-0" />
      </div>

      {/* 4. Command Prompt Bar (Permanent, pinned at the bottom) */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 px-3 py-2 border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <span className="text-emerald-400 font-bold select-none text-xs">
          user@k8s:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="kubectl get pods..."
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-mono"
        />
        <button
          type="submit"
          className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition shadow-sm active:scale-95 shrink-0"
          title="Execute Command (Enter)"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
