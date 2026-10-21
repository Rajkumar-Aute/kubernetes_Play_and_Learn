import React, { useState } from 'react';
import {
  Bot,
  Lightbulb,
  Pause,
  Send,
  Zap,
  ArrowRight,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  HelpCircle as QuestionIcon
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
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const tutorial = MISSION_TUTORIALS[state.currentLevelId] || MISSION_TUTORIALS[1];

  // Find active step (first uncompleted step, or last step if all complete)
  const activeStep: TutorialStep =
    tutorial.steps.find((s) => !s.isComplete(state)) || tutorial.steps[tutorial.steps.length - 1];

  const isCurrentStepDone = activeStep.isComplete(state);
  const fresher = activeStep.fresherDetail;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-cyan-800/80 rounded-2xl p-4 shadow-2xl select-none transition-all">
      {/* Main Mentor Header & Dialogue */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Captain Kube Avatar & Speech Bubble */}
        <div className="flex items-start gap-3 flex-1">
          {/* Animated Captain Kube Avatar */}
          <div className="relative shrink-0 mt-0.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                activeStep.mentorMood === 'celebrate'
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 scale-105 animate-bounce shadow-amber-500/30'
                  : activeStep.mentorMood === 'alert'
                  ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white animate-pulse shadow-rose-500/30'
                  : 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-500/30'
              }`}
            >
              <Bot className="w-7 h-7" />
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
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/80 flex items-center gap-1">
                <span>Captain Kube</span>
                <span className="text-slate-400">|</span>
                <span className="text-cyan-400 font-semibold">Mission {state.currentLevelId}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Step {activeStep.stepNumber} of {activeStep.totalSteps}
              </span>
              {/* Step indicator dots */}
              <div className="flex items-center gap-1">
                {tutorial.steps.map((s, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      s.isComplete(state)
                        ? 'bg-emerald-400 scale-110 shadow-sm shadow-emerald-500/50'
                        : s.id === activeStep.id
                        ? 'bg-cyan-400 scale-125 animate-pulse shadow-sm shadow-cyan-500/50'
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
                {activeStep.highlightTarget === 'auto-traffic' ? (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onToggleAutoTraffic();
                    }}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md glow-emerald active:scale-95 transition flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Turn ON Auto-Traffic</span>
                  </button>
                ) : activeStep.highlightTarget !== 'none' && activeStep.highlightTarget !== 'test-request' ? (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onActionClick(activeStep.highlightTarget);
                    }}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md glow-cyan active:scale-95 transition"
                  >
                    {activeStep.actionButtonLabel}
                  </button>
                ) : null}
              </div>
            )}

            {/* Live Progress bar if tracking requests */}
            {state.currentLevelId === 1 && activeStep.stepNumber === 3 && (
              <div className="pt-1.5 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                  <span>Progress to Complete Mission:</span>
                  <span className="text-cyan-300 font-bold">
                    {Math.min(10, state.successfulRequests)} / 10 requests served
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (state.successfulRequests / 10) * 100)}%` }}
                  />
                </div>
              </div>
            )}
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
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition ${
                isAutoTraffic
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm'
                  : activeStep.highlightTarget === 'auto-traffic'
                  ? 'bg-cyan-600 text-white border-cyan-400 ring-2 ring-cyan-400 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={isAutoTraffic ? 'Pause auto-traffic stream' : 'Enable continuous background traffic'}
            >
              {isAutoTraffic ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Auto: ON</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-slate-400" />
                  <span>Auto: OFF</span>
                </>
              )}
            </button>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2">
            {/* Quick Beginner Guide Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenHowToPlay();
              }}
              className="px-2 py-1 text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition"
              title="Open full beginner guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Guide</span>
            </button>

            {/* Toggle Fresher Deep Dive Drawer Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsDeepDiveOpen(!isDeepDiveOpen);
              }}
              className="px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/80 rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{isDeepDiveOpen ? 'Hide Deep Dive' : '🎓 Fresher Deep Dive'}</span>
              {isDeepDiveOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Fresher Deep Dive Drawer */}
      {isDeepDiveOpen && (
        <div className="mt-3 pt-3 border-t border-slate-800/90 text-xs text-slate-300 space-y-3 animate-fade-in bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Fresher Learning Guide: {tutorial.title} ({tutorial.conceptName})
            </span>
            <span className="text-[10px] text-slate-500">Explain Like I&apos;m 5</span>
          </div>

          {/* 1. Real World Analogy */}
          <div className="bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <span>🏢 Real-World Analogy:</span>
            </span>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              {fresher.analogy}
            </p>
          </div>

          {/* 2. What is Happening Step-by-Step */}
          <div className="space-y-1">
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Behind the Scenes in Kubernetes:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              {fresher.whatIsHappening.map((item, idx) => (
                <div key={idx} className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Interview Tip & Key Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            <div className="bg-blue-950/30 border border-blue-900/50 p-2.5 rounded-lg space-y-1">
              <span className="font-bold text-sky-300 flex items-center gap-1 text-[11px]">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>DevOps Interview Tip:</span>
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {fresher.interviewTip}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg space-y-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1 text-[11px]">
                <QuestionIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Key Terms to Know:</span>
              </span>
              <div className="space-y-1 text-[11px]">
                {fresher.keyTerms.map((kt, idx) => (
                  <div key={idx}>
                    <strong className="text-cyan-300">{kt.term}: </strong>
                    <span className="text-slate-400">{kt.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
