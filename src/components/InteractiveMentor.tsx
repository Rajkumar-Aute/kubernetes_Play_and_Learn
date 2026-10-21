import React from 'react';
import {
  Bot,
  Lightbulb,
  Pause,
  Send,
  Zap,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import type { GameState } from '../types/game';
import { MISSION_TUTORIALS } from '../data/interactiveTutorials';
import type { TutorialStep } from '../data/interactiveTutorials';
import { soundEngine } from '../services/soundEngine';

interface InteractiveMentorProps {
  state: GameState;
  onActionClick: (action: string) => void;
  onSendTestPacket: () => void;
  onToggleAutoTraffic: () => void;
  isAutoTraffic: boolean;
  onOpenHowToPlay: () => void;
}

export const InteractiveMentor: React.FC<InteractiveMentorProps> = ({
  state,
  onActionClick,
  onSendTestPacket,
  onToggleAutoTraffic,
  isAutoTraffic,
  onOpenHowToPlay
}) => {
  const tutorial = MISSION_TUTORIALS[state.currentLevelId] || MISSION_TUTORIALS[1];

  // Find active step (first uncompleted step, or last step if all complete)
  const activeStep: TutorialStep =
    tutorial.steps.find((s) => !s.isComplete(state)) || tutorial.steps[tutorial.steps.length - 1];

  const isCurrentStepDone = activeStep.isComplete(state);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-cyan-800/80 rounded-2xl p-3.5 shadow-xl select-none transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Captain Kube Avatar & Speech Bubble */}
        <div className="flex items-start gap-3 flex-1">
          {/* Animated Captain Kube Avatar */}
          <div className="relative shrink-0 mt-0.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                activeStep.mentorMood === 'celebrate'
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 scale-105 animate-bounce shadow-amber-500/30'
                  : activeStep.mentorMood === 'alert'
                  ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white animate-pulse shadow-rose-500/30'
                  : 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-500/30'
              }`}
            >
              <Bot className="w-6 h-6" />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isCurrentStepDone ? 'bg-emerald-400' : 'bg-cyan-400 animate-ping'
              }`}
            />
          </div>

          {/* Dialogue & Instruction Bubble */}
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/80">
                Captain Kube (Mentor)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Step {activeStep.stepNumber} of {activeStep.totalSteps}
              </span>
              {/* Step dots */}
              <div className="flex items-center gap-1">
                {tutorial.steps.map((s, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      s.isComplete(state)
                        ? 'bg-emerald-400 scale-110'
                        : s.id === activeStep.id
                        ? 'bg-cyan-400 scale-125 animate-pulse'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Speaking Dialogue */}
            <p className="text-xs sm:text-[13px] text-slate-200 leading-snug font-medium">
              {isCurrentStepDone ? activeStep.successFeedback : activeStep.dialogue}
            </p>

            {/* Clear Action Callout */}
            {!isCurrentStepDone && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{activeStep.actionPrompt}</span>
                </span>
                {activeStep.highlightTarget !== 'none' && activeStep.highlightTarget !== 'test-request' && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onActionClick(activeStep.highlightTarget);
                    }}
                    className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm glow-cyan active:scale-95 transition"
                  >
                    {activeStep.actionButtonLabel}
                  </button>
                )}
              </div>
            )}

            {/* What you learn note */}
            <div className="flex items-start gap-1.5 text-[11px] text-slate-400 pt-0.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300">Why this matters: </strong>
                {activeStep.educationalTakeaway}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Direct Interactive Controls (Send Test Request, Auto Traffic) */}
        <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 self-end md:self-center w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Direct Send Test Request Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onSendTestPacket();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition shadow-md active:scale-95 ${
                activeStep.highlightTarget === 'test-request'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 ring-2 ring-emerald-400 animate-pulse glow-emerald'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
              }`}
              title="Send 1 HTTP request through Ingress -> Service -> Pod to inspect the path"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Send 1 Request</span>
            </button>

            {/* Auto-traffic Toggle */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleAutoTraffic();
              }}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition ${
                isAutoTraffic
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
              title={isAutoTraffic ? 'Pause auto-traffic' : 'Enable continuous background traffic'}
            >
              {isAutoTraffic ? (
                <>
                  <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>Auto: ON</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-slate-400" />
                  <span>Auto: OFF</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Help Guide Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenHowToPlay();
            }}
            className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition pr-1"
          >
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>How to play guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
