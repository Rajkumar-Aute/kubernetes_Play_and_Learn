import React from 'react';
import { WAVES } from '../game/constants';
import type { GameEngine } from '../game/engine';

interface WaveHUDProps {
  engine: GameEngine;
  coins: number;
  slaHealth: number;
  currentWave: number;
  waveStatus: string;
  score: number;
  gameSpeed: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleSpeed: () => void;
  onOpenHowToPlay: () => void;
  onStartWave: () => void;
}

export const WaveHUD: React.FC<WaveHUDProps> = ({
  coins,
  slaHealth,
  currentWave,
  waveStatus,
  score,
  gameSpeed,
  isMuted,
  onToggleMute,
  onToggleSpeed,
  onOpenHowToPlay,
  onStartWave
}) => {
  const waveDef = WAVES[currentWave - 1] || WAVES[0];
  const isRunning = waveStatus === 'running';

  const slaColor =
    slaHealth > 60
      ? 'from-emerald-500 to-teal-400'
      : slaHealth > 25
      ? 'from-amber-500 to-yellow-400'
      : 'from-rose-600 to-red-500 animate-pulse';

  return (
    <header className="w-full max-w-[1040px] mx-auto mb-3 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Wave Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-lg font-black shadow-md shadow-cyan-900/40">
            ⎈
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wider uppercase">
                KubeTower
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                Wave {currentWave}/{WAVES.length}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {waveDef.title}
            </div>
          </div>
        </div>

        {/* SLA Health Bar */}
        <div className="flex-1 min-w-[140px] max-w-[220px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Cluster SLA
            </span>
            <span
              className={`font-mono font-bold text-xs ${
                slaHealth > 60
                  ? 'text-emerald-400'
                  : slaHealth > 25
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {slaHealth}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${slaColor}`}
              style={{ width: `${slaHealth}%` }}
            />
          </div>
        </div>

        {/* Economy & Score */}
        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-inner">
            <span className="text-base">🪙</span>
            <span>{coins}</span>
          </div>

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] text-slate-500 font-sans uppercase">Score</span>
            <span className="text-xs font-bold text-slate-200">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* Controls & Action Button */}
        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={onToggleSpeed}
            title="Toggle Game Speed"
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {gameSpeed}x
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* How to Play Help Button */}
          <button
            onClick={onOpenHowToPlay}
            title="How to Play"
            className="p-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition"
          >
            ❓ Help
          </button>

          {/* Start Wave Button */}
          <button
            disabled={isRunning}
            onClick={onStartWave}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 ${
              isRunning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-900/50 scale-105 animate-pulse'
            }`}
          >
            {isRunning ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Traffic Active
              </>
            ) : (
              <>
                <span>▶</span> Deploy Wave {currentWave}
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
