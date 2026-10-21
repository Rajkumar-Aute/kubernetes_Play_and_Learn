import React from 'react';
import { X, CheckCircle, AlertTriangle, Skull, Clock, Terminal, Activity, RefreshCw } from 'lucide-react';
import type { Pod } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface PodInspectorModalProps {
  pod: Pod | null;
  onClose: () => void;
  onRestartPod: (podId: string) => void;
}

export const PodInspectorModal: React.FC<PodInspectorModalProps> = ({
  pod,
  onClose,
  onRestartPod
}) => {
  if (!pod) return null;

  const isRunning = pod.status === 'Running';
  const isCrashLoop = pod.status === 'CrashLoopBackOff';
  const isOOM = pod.status === 'OOMKilled';
  const isPending = pod.status === 'Pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 flex flex-col max-h-[85vh] overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{pod.name}</span>
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-800 text-sky-300">
                  {pod.version}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Node: <span className="text-cyan-300">{pod.nodeId}</span> | Deployment:{' '}
                <span className="text-cyan-300">{pod.deploymentName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status & Metrics */}
        <div className="grid grid-cols-2 gap-2 my-3 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Pod Status</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold">
              {isRunning && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              {isCrashLoop && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              {isOOM && <Skull className="w-3.5 h-3.5 text-fuchsia-400" />}
              {isPending && <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
              <span
                className={
                  isRunning
                    ? 'text-emerald-400'
                    : isCrashLoop
                    ? 'text-rose-400'
                    : isOOM
                    ? 'text-fuchsia-400'
                    : 'text-amber-400'
                }
              >
                {pod.status}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Restarts</span>
            <span className="font-bold text-amber-400 text-sm mt-1 block">
              {pod.restarts} {pod.restarts === 1 ? 'restart' : 'restarts'}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">CPU Usage / Limit</span>
            <span className="font-bold text-cyan-300 text-xs mt-1 block">
              {Math.round(pod.cpuUsage)}% / {pod.cpuLimit}m
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Mem Usage / Limit</span>
            <span className="font-bold text-purple-300 text-xs mt-1 block">
              {Math.round(pod.memoryUsage)}Mi / {pod.memoryLimit}Mi
            </span>
          </div>
        </div>

        {/* Live Container Logs */}
        <div className="flex-1 flex flex-col min-h-[160px] bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Activity className="w-3.5 h-3.5" /> kubectl logs {pod.name}
            </span>
            <span className="text-[10px] text-slate-500">Live stdout</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-xs select-text">
            {pod.logs.map((log, index) => {
              const isErr = log.includes('FATAL') || log.includes('error') || log.includes('Kill') || log.includes('OOM');
              return (
                <div
                  key={index}
                  className={`leading-relaxed ${
                    isErr ? 'text-rose-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 mt-2 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onRestartPod(pod.id);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restart Pod</span>
          </button>
        </div>
      </div>
    </div>
  );
};
