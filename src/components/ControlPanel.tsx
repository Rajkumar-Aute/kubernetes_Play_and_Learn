import React from 'react';
import {
  Plus,
  Minus,
  UploadCloud,
  Wrench,
  Gauge,
  Link,
  ServerPlus,
  Play,
  Pause,
  FastForward,
  Flame,
  CheckCircle2
} from 'lucide-react';
import type { GameState } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface ControlPanelProps {
  state: GameState;
  onScale: (delta: number) => void;
  onRolloutV2: () => void;
  onFixEnv: () => void;
  onIncreaseLimits: () => void;
  onFixServiceSelector: () => void;
  onToggleHPA: () => void;
  onAddNode: () => void;
  onTriggerChaos: () => void;
  onTogglePause: () => void;
  onToggleSpeed: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onScale,
  onRolloutV2,
  onFixEnv,
  onIncreaseLimits,
  onFixServiceSelector,
  onToggleHPA,
  onAddNode,
  onTriggerChaos,
  onTogglePause,
  onToggleSpeed
}) => {
  const dep = state.deployments[0];
  const svc = state.services[0];
  const isV2 = dep?.version === 'v2.0';
  const hasDbEnv = dep?.env['DB_HOST'];
  const hasHighMemory = dep?.memoryLimit >= 256;
  const isSelectorCorrect = svc?.selector['app'] === 'web';

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cluster Actions
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
            Replicas: {dep?.desiredReplicas || 0}
          </span>
        </div>

        {/* Time & Speed Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              soundEngine.playClick();
              onTogglePause();
            }}
            className={`p-1.5 rounded transition ${
              state.isPaused ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={state.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {state.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleSpeed();
            }}
            className={`px-2 py-1 text-xs font-mono font-bold rounded transition flex items-center gap-1 ${
              state.gameSpeed > 1
                ? 'bg-cyan-600 text-white glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Fast Forward (2x Speed)"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{state.gameSpeed}x</span>
          </button>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {/* Scale Down */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onScale(-1);
          }}
          disabled={!dep || dep.desiredReplicas <= 0}
          className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition shadow-sm"
        >
          <Minus className="w-3.5 h-3.5 text-rose-400" />
          <span>Scale -1</span>
        </button>

        {/* Scale Up */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onScale(1);
          }}
          disabled={!dep || dep.desiredReplicas >= 8}
          className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition shadow-md glow-blue"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Scale +1</span>
        </button>

        {/* Rollout v2 */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onRolloutV2();
          }}
          disabled={isV2}
          className={`px-2.5 py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition shadow-sm ${
            isV2
              ? 'bg-slate-800/60 text-slate-500 border-slate-800 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 glow-blue'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{isV2 ? 'v2.0 Active' : 'Rollout v2'}</span>
        </button>

        {/* Fix Config / DB_HOST */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onFixEnv();
          }}
          disabled={!!hasDbEnv}
          className={`px-2.5 py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition shadow-sm ${
            hasDbEnv
              ? 'bg-slate-800/60 text-emerald-400 border-slate-800 cursor-not-allowed'
              : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 glow-amber animate-pulse-subtle'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>{hasDbEnv ? 'Env Injected' : 'Fix DB_HOST'}</span>
        </button>

        {/* Set Memory Limit */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onIncreaseLimits();
          }}
          disabled={hasHighMemory}
          className={`px-2.5 py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition shadow-sm ${
            hasHighMemory
              ? 'bg-slate-800/60 text-purple-300 border-slate-800 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 glow-cyan'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>{hasHighMemory ? '256Mi Limit' : 'Tune Limits'}</span>
        </button>

        {/* Connect Service Selector */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onFixServiceSelector();
          }}
          disabled={isSelectorCorrect}
          className={`px-2.5 py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition shadow-sm ${
            isSelectorCorrect
              ? 'bg-slate-800/60 text-emerald-400 border-slate-800 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 glow-emerald animate-pulse-subtle'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          <span>{isSelectorCorrect ? 'Svc Linked' : 'Link Service'}</span>
        </button>

        {/* HPA Toggle */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleHPA();
          }}
          className={`px-2.5 py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition shadow-sm ${
            dep?.hpaEnabled
              ? 'bg-cyan-600 text-white border-cyan-400 glow-cyan'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          {dep?.hpaEnabled ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          ) : (
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>{dep?.hpaEnabled ? 'HPA ON' : 'Enable HPA'}</span>
        </button>

        {/* Add Worker Node */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onAddNode();
          }}
          disabled={state.nodes.length >= 4}
          className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition shadow-sm"
        >
          <ServerPlus className="w-3.5 h-3.5 text-sky-400" />
          <span>+ Node</span>
        </button>
      </div>

      {/* Survival mode Chaos generator button */}
      {state.mode === 'survival' && (
        <div className="mt-2 pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playAlert();
              onTriggerChaos();
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md glow-rose flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4" />
            <span>Unleash Chaos Event</span>
          </button>
        </div>
      )}
    </div>
  );
};
