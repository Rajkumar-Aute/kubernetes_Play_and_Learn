import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, HelpCircle } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const commandChips = [
    'kubectl get pods',
    'kubectl get nodes',
    'kubectl get svc',
    'kubectl scale deployment web --replicas=3',
    'kubectl logs backend-78b-crash',
    'kubectl set resources deployment web --limits=memory=256Mi'
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
    <div className="bg-slate-950/95 border border-slate-800 rounded-xl flex flex-col h-[280px] shadow-xl overflow-hidden font-mono">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-cyan-300">kubectl CLI Terminal</span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            cluster: kubedefender-prod
          </span>
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
            title="Clear terminal"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Logs Output */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 text-xs select-text leading-relaxed"
      >
        <div className="text-slate-500 text-[11px] mb-2 border-b border-slate-900 pb-1">
          Type kubectl commands or tap suggestion chips below. Try `kubectl get pods` or `kubectl help`.
        </div>

        {state.terminalHistory.map((item, index) => {
          let colorClass = 'text-slate-300';
          if (item.type === 'cmd') colorClass = 'text-cyan-400 font-bold';
          if (item.type === 'error') colorClass = 'text-rose-400 font-semibold';
          if (item.type === 'success') colorClass = 'text-emerald-400 font-semibold';

          return (
            <div key={index} className={`whitespace-pre-wrap break-all ${colorClass}`}>
              {item.text}
            </div>
          );
        })}
      </div>

      {/* Quick Command Chips (Great for Mobile / YouTube Playables!) */}
      <div className="px-2 py-1 bg-slate-900/60 border-t border-slate-900 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider shrink-0 mr-1">
          Suggestions:
        </span>
        {commandChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundEngine.playClick();
              onExecuteCommand(chip);
            }}
            className="shrink-0 text-[10px] bg-slate-800/80 hover:bg-slate-700 text-sky-300 hover:text-cyan-200 px-2 py-0.5 rounded border border-slate-700/60 transition"
          >
            {chip.replace('kubectl ', '')}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/90 border-t border-slate-800 px-3 py-1.5 flex items-center gap-2"
      >
        <span className="text-cyan-400 font-bold select-none">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="kubectl get pods..."
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
        />
        <button
          type="submit"
          className="p-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition shadow-sm"
          title="Run Command"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
