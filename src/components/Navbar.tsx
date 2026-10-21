import React from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  BookOpen,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  ListOrdered,
  HelpCircle
} from 'lucide-react';
import type { GameMode } from '../types/game';
import { LEVELS } from '../data/levels';
import { soundEngine } from '../services/soundEngine';

interface NavbarProps {
  currentLevelId: number;
  mode: GameMode;
  isMuted: boolean;
  score: number;
  sla: number;
  onSelectLevel: (levelId: number) => void;
  onToggleMode: (mode: GameMode) => void;
  onToggleAudio: () => void;
  onOpenGlossary: () => void;
  onOpenBriefing: () => void;
  onOpenHowToPlay: () => void;
  onResetLevel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLevelId,
  mode,
  isMuted,
  score,
  sla,
  onSelectLevel,
  onToggleMode,
  onToggleAudio,
  onOpenGlossary,
  onOpenBriefing,
  onOpenHowToPlay,
  onResetLevel
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-3 py-2 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 shadow-lg">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-md glow-cyan">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent flex items-center gap-1.5">
              KubeDefender
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-950 text-cyan-400 border border-cyan-800">
                Play & Learn
              </span>
            </h1>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMode('campaign');
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'campaign'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Missions</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMode('survival');
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'survival'
                ? 'bg-rose-600 text-white shadow-sm glow-rose'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chaos Arcade</span>
          </button>
        </div>
      </div>

      {/* Level Selector or Survival Stats */}
      {mode === 'campaign' ? (
        <div className="flex items-center gap-2">
          <select
            value={currentLevelId}
            onChange={(e) => {
              soundEngine.playClick();
              onSelectLevel(Number(e.target.value));
            }}
            aria-label="Select Mission"
            className="bg-slate-950 text-cyan-300 text-xs font-medium border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {LEVELS.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                Mission {lvl.id}: {lvl.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenBriefing();
            }}
            title="Mission Briefing & Objectives"
            className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
          >
            <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Briefing</span>
          </button>

          {/* Prominent How to Play Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenHowToPlay();
            }}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white shadow-md glow-cyan flex items-center gap-1.5 transition"
            title="How to Play Tutorial"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/60">
            <Flame className="w-3.5 h-3.5" />
            <span>Chaos Mode</span>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenHowToPlay();
            }}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white shadow-md glow-cyan flex items-center gap-1.5 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </button>
        </div>
      )}

      {/* Stats & Actions */}
      <div className="flex items-center gap-2">
        {/* SLA meter */}
        <div
          title="Cluster SLA Uptime"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs"
        >
          <CheckCircle2
            className={`w-3.5 h-3.5 ${
              sla >= 95 ? 'text-emerald-400' : sla >= 80 ? 'text-amber-400' : 'text-rose-400'
            }`}
          />
          <span className="text-slate-400 hidden xs:inline">SLA:</span>
          <span
            className={`font-mono font-bold ${
              sla >= 95 ? 'text-emerald-300' : sla >= 80 ? 'text-amber-300' : 'text-rose-300'
            }`}
          >
            {sla}%
          </span>
        </div>

        {/* Score */}
        <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase block leading-none">Score</span>
          <span className="font-bold text-cyan-300 text-xs leading-tight">{score}</span>
        </div>

        {/* Glossary button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenGlossary();
          }}
          title="Kubernetes Glossary & Cheatsheet"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <BookOpen className="w-4 h-4 text-sky-400" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleAudio();
          }}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* Reset / Restart */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onResetLevel();
          }}
          title="Restart Mission"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
