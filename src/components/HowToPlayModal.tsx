import React from 'react';
import { X, Play, Shield, Globe, Layers, Server, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md glow-cyan">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>How to Play KubeDefender</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Beginner Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Learn Kubernetes by running, scaling, and debugging a live cluster
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-slate-300 text-xs leading-relaxed">
          {/* Core Concept Flow Diagram */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 block">
              1. The 3-Step Cluster Flow
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900 p-3 rounded-lg border border-cyan-900/40">
                <Globe className="w-6 h-6 text-cyan-400 mx-auto mb-1.5" />
                <span className="font-bold text-white block text-xs">1. User Traffic</span>
                <span className="text-[11px] text-slate-400">
                  Requests enter via Ingress from the web
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-blue-900/40">
                <Layers className="w-6 h-6 text-blue-400 mx-auto mb-1.5" />
                <span className="font-bold text-white block text-xs">2. Service Proxy</span>
                <span className="text-[11px] text-slate-400">
                  Load balances traffic across ready Pods
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-emerald-900/40">
                <Server className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                <span className="font-bold text-white block text-xs">3. Pods on Nodes</span>
                <span className="text-[11px] text-slate-400">
                  Containers process requests with 200 OK
                </span>
              </div>
            </div>
          </div>

          {/* How to Control the Game */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 block">
              2. How to Control &amp; Play
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-sky-300">
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span>Option A: Click Action Buttons</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Use the bottom action bar (e.g. <b>Scale +1</b>, <b>Rollout v2</b>, <b>Fix DB_HOST</b>, <b>Fix OOM</b>). Look for the button with the animated glowing highlight!
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-sky-300">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Option B: Use the `kubectl` CLI</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Type real commands like <code className="text-cyan-300">kubectl get pods</code> or tap the suggestion chips above the input bar!
                </p>
              </div>
            </div>
          </div>

          {/* What You Learn */}
          <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-blue-300 font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>What You Will Learn Across the 8 Missions:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>Pods:</b> Smallest deployable unit</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>Deployments:</b> Scaling replicas</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>Services:</b> Load balancing &amp; selectors</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>CrashLoopBackOff:</b> Logs &amp; env secrets</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>OOMKilled:</b> Memory limits vs CPU throttling</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>Rolling Updates:</b> Zero-downtime v1 &rarr; v2</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>Self-Healing:</b> Surviving dead nodes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>Autoscaler (HPA):</b> Dynamic elasticity</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg glow-cyan flex items-center justify-center gap-2 transition"
          >
            <span>Got It! Let&apos;s Play</span>
          </button>
        </div>
      </div>
    </div>
  );
};
