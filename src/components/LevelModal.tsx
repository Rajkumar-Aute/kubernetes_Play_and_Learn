import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle,
  Circle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  Star,
  RotateCcw
} from 'lucide-react';
import type { Level, GameState } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface LevelModalProps {
  level: Level;
  state: GameState;
  isOpen: boolean;
  isVictory: boolean;
  onClose: () => void;
  onNextLevel: () => void;
  onRestartLevel: () => void;
}

export const LevelModal: React.FC<LevelModalProps> = ({
  level,
  state,
  isOpen,
  isVictory,
  onClose,
  onNextLevel,
  onRestartLevel
}) => {
  useEffect(() => {
    if (isVictory && isOpen) {
      soundEngine.playLevelWin();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isVictory, isOpen]);

  if (!isOpen) return null;

  const stars = state.sla >= 98 ? 3 : state.sla >= 90 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow backdrop decorative effect */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {isVictory ? (
          /* VICTORY VIEW */
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                Mission Accomplished!
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {level.name} Cleared
              </h2>
              <p className="text-xs text-slate-400 mt-1">{level.subtitle}</p>
            </div>

            {/* Stars */}
            <div className="flex justify-center items-center gap-2 py-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-7 h-7 transition-all ${
                    s <= stars
                      ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Cluster SLA</span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  {state.sla}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Requests Handled</span>
                <span className="font-mono text-base font-bold text-cyan-300">
                  {state.successfulRequests}
                </span>
              </div>
            </div>

            {/* Educational Takeaway */}
            <div className="text-left bg-blue-950/30 border border-blue-800/40 p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Kubernetes Key Takeaway:</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {level.explanation}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onRestartLevel();
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onNextLevel();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg glow-cyan flex items-center justify-center gap-2 transition"
              >
                <span>Next Mission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* BRIEFING VIEW */
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-950 text-cyan-400 border border-cyan-800">
                    Mission {level.id} of 8
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Concept: {level.k8sConcept}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1.5">
                  {level.name}
                </h2>
                <p className="text-xs text-cyan-300 font-medium">{level.subtitle}</p>
              </div>
            </div>

            {/* Briefing text */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
              {level.briefing}
            </div>

            {/* Objectives checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Mission Objectives:
              </span>
              <div className="space-y-1.5">
                {level.objectives.map((obj) => {
                  const done = obj.isCompleted(state);
                  return (
                    <div
                      key={obj.id}
                      className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${
                        done
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300'
                      }`}
                    >
                      {done ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold block">{obj.title}</span>
                        <span className="text-[11px] text-slate-400">{obj.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hints Accordion / Box */}
            <div className="bg-cyan-950/20 border border-cyan-900/40 p-2.5 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Tactical Hints:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 pl-1">
                {level.hints.map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </div>

            {/* Start button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg glow-cyan flex items-center justify-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Enter Cluster &amp; Begin Mission</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
