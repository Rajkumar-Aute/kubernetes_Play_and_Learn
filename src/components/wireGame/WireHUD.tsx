import React from 'react';
import type { WireEngine } from '../../wireGame/engine';

interface WireHUDProps {
  engine: WireEngine;
  currentLevelId: number;
  deliveredCount: number;
  targetDeliveries: number;
  droppedCount: number;
  maxDroppedAllowed: number;
  wiresCount: number;
  maxWires: number;
  speed: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleSpeed: () => void;
  onResetWires: () => void;
  onOpenLesson: () => void;
}

export const WireHUD: React.FC<WireHUDProps> = ({
  engine,
  currentLevelId,
  deliveredCount,
  targetDeliveries,
  droppedCount,
  maxDroppedAllowed,
  wiresCount,
  maxWires,
  speed,
  isMuted,
  onToggleMute,
  onToggleSpeed,
  onResetWires,
  onOpenLesson
}) => {
  const levelDef = engine.getCurrentLevel();
  const deliveryRatio = Math.min(100, Math.round((deliveredCount / targetDeliveries) * 100));

  return (
    <header className="w-full max-w-[1040px] mx-auto mb-3 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title & Level Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-md shadow-indigo-900/40">
            🔌
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wider uppercase">
                KubeWire
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                Lvl {currentLevelId} / 8
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs font-mono">
              {levelDef.title}
            </div>
          </div>
        </div>

        {/* Deliveries Progress Bar */}
        <div className="flex-1 min-w-[160px] max-w-[220px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Packets Routed
            </span>
            <span className="font-mono font-bold text-xs text-cyan-400">
              {deliveredCount} / {targetDeliveries}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${deliveryRatio}%` }}
            />
          </div>
        </div>

        {/* Wires & Dropped Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Wires Used */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-300">
            <span>⚡ Wires:</span>
            <span
              className={`font-bold ${
                wiresCount >= maxWires ? 'text-amber-400' : 'text-slate-100'
              }`}
            >
              {wiresCount}/{maxWires}
            </span>
          </div>

          {/* Dropped / Errors */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
              droppedCount > 0
                ? 'bg-red-950/40 border-red-800/80 text-red-300'
                : 'bg-slate-950/80 border-slate-700 text-slate-400'
            }`}
          >
            <span>⚠️ Drops:</span>
            <span className="font-bold">
              {droppedCount}/{maxDroppedAllowed}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={onToggleSpeed}
            title="Toggle Speed"
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {speed}x
          </button>

          {/* Audio Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Reset Wires */}
          <button
            onClick={onResetWires}
            title="Clear all wires"
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
          >
            🔄 Rewire
          </button>

          {/* Concept Guide Button */}
          <button
            onClick={onOpenLesson}
            title="Kubernetes Concept & YAML"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/50 transition flex items-center gap-1"
          >
            <span>📖</span>
            <span className="hidden sm:inline">Concept & YAML</span>
          </button>
        </div>
      </div>

      {/* Level Objective Hint Banner */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
            Goal:
          </span>
          <span className="text-slate-300">{levelDef.objective}</span>
        </div>
        <div className="hidden md:block text-[11px] text-slate-500 font-mono">
          Tip: Click & drag from any node to another to draw a wire
        </div>
      </div>
    </header>
  );
};
