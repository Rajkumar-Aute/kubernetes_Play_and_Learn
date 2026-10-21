import React from 'react';
import {
  Server,
  Layers,
  Globe,
  Cpu,
  HardDrive,
  Activity,
  AlertTriangle,
  Skull,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import type { GameState, Pod } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface ClusterCanvasProps {
  state: GameState;
  onSelectPod: (podId: string) => void;
  onSelectNode: (nodeId: string) => void;
}

export const ClusterCanvas: React.FC<ClusterCanvasProps> = ({
  state,
  onSelectPod,
  onSelectNode
}) => {
  const service = state.services[0];
  const ingress = state.ingress;

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950/80 rounded-xl border border-slate-800 p-4 overflow-hidden flex flex-col justify-between select-none">
      {/* Background network grid effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.25) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Chaos Alert banner if active */}
      {state.chaosActive && state.activeChaosEvent && (
        <div className="relative z-10 mb-3 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs font-semibold flex items-center justify-between shadow-lg glow-rose animate-pulse-subtle">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>CHAOS ALERT: {state.activeChaosEvent}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-900 text-rose-100">
            Emergency
          </span>
        </div>
      )}

      {/* Main Cluster Topology */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 items-stretch">
        {/* Left Column: Internet & Ingress Gateway */}
        <div className="md:col-span-3 flex flex-col justify-center space-y-4">
          <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-3 shadow-lg glow-cyan/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Ingress Controller
                </span>
              </div>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 rounded border border-cyan-800">
                80/443
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Path: <code className="text-cyan-300 font-mono">/</code> &rarr;{' '}
              <span className="text-sky-300 font-mono">{ingress.rules[0]?.serviceName}</span>
            </p>
            <div className="flex items-center justify-between text-xs bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400">Incoming Load:</span>
              <span className="font-mono font-bold text-cyan-300 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                {state.trafficRate} req/s
              </span>
            </div>
          </div>

          {/* Center Connection / Service Proxy */}
          <div className="bg-slate-900/90 border border-blue-800/60 rounded-xl p-3 shadow-lg glow-blue/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Service (ClusterIP)
                </span>
              </div>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-blue-950 text-blue-400 rounded border border-blue-800">
                {service?.clusterIP || '10.96.0.1'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Selector:</span>
                <span
                  className={`font-mono font-bold ${
                    service?.selector['app'] === 'web'
                      ? 'text-emerald-400'
                      : 'text-amber-400 underline decoration-wavy'
                  }`}
                >
                  app: {service?.selector['app'] || 'none'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Algorithm:</span>
                <span className="text-slate-300 font-mono">Round-Robin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Worker Nodes & Pods */}
        <div className="md:col-span-9 flex flex-col space-y-3 justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.nodes.map((node) => {
              const nodePods = state.pods.filter(
                (p) => p.nodeId === node.id && p.status !== 'Terminating'
              );
              const cpuPercent = Math.min(
                100,
                Math.round((node.cpuAllocated / node.cpuCapacity) * 100)
              );
              const memPercent = Math.min(
                100,
                Math.round((node.memoryAllocated / node.memoryCapacity) * 100)
              );
              const isDead = node.status !== 'Ready';

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectNode(node.id);
                  }}
                  className={`relative rounded-xl border p-3 transition-all cursor-pointer ${
                    isDead
                      ? 'bg-rose-950/30 border-rose-800/80 shadow-md'
                      : state.selectedNodeId === node.id
                      ? 'bg-slate-900 border-cyan-500 shadow-md glow-cyan/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Node Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Server
                        className={`w-4 h-4 ${isDead ? 'text-rose-500' : 'text-slate-300'}`}
                      />
                      <span className="text-xs font-bold text-slate-200">{node.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isDead
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  {/* Node Resource Meters */}
                  <div className="space-y-1.5 mb-3 text-[10px] font-mono">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-cyan-400" /> CPU
                        </span>
                        <span>{cpuPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-300 ${
                            cpuPercent > 85
                              ? 'bg-rose-500'
                              : cpuPercent > 65
                              ? 'bg-amber-400'
                              : 'bg-cyan-500'
                          }`}
                          style={{ width: `${cpuPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-purple-400" /> Mem
                        </span>
                        <span>{memPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-300 ${
                            memPercent > 85
                              ? 'bg-rose-500'
                              : memPercent > 65
                              ? 'bg-amber-400'
                              : 'bg-purple-500'
                          }`}
                          style={{ width: `${memPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pods inside Node */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-800/80 pt-1.5">
                      <span>Pods ({nodePods.length})</span>
                    </div>

                    {nodePods.length === 0 ? (
                      <div className="text-center py-4 text-[11px] text-slate-600 border border-dashed border-slate-800 rounded-lg">
                        No pods scheduled
                      </div>
                    ) : (
                      nodePods.map((pod) => (
                        <PodCard
                          key={pod.id}
                          pod={pod}
                          isSelected={state.selectedPodId === pod.id}
                          onClick={() => {
                            soundEngine.playClick();
                            onSelectPod(pod.id);
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Traffic Packet Particles Canvas Overlay */}
      <TrafficCanvasOverlay packets={state.packets} />
    </div>
  );
};

interface PodCardProps {
  pod: Pod;
  isSelected: boolean;
  onClick: () => void;
}

const PodCard: React.FC<PodCardProps> = ({ pod, isSelected, onClick }) => {
  const isRunning = pod.status === 'Running';
  const isCrashLoop = pod.status === 'CrashLoopBackOff';
  const isOOM = pod.status === 'OOMKilled';
  const isPending = pod.status === 'Pending';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`rounded-lg p-2 transition-all border cursor-pointer ${
        isSelected
          ? 'bg-slate-800 border-cyan-400 shadow-md glow-cyan/40 scale-[1.02]'
          : isRunning
          ? 'bg-slate-950/90 border-emerald-800/60 hover:border-emerald-500'
          : isCrashLoop
          ? 'bg-rose-950/40 border-rose-600/80 animate-pulse'
          : isOOM
          ? 'bg-fuchsia-950/40 border-fuchsia-600/80'
          : 'bg-amber-950/30 border-amber-800/60'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[11px] font-bold text-slate-200 truncate max-w-[100px]">
          {pod.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-sky-300">
            {pod.version}
          </span>
          {pod.restarts > 0 && (
            <span
              title="Restarts"
              className="text-[9px] font-mono px-1 rounded bg-amber-950 text-amber-300 flex items-center gap-0.5"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              {pod.restarts}
            </span>
          )}
        </div>
      </div>

      {/* Pod status badge */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1 font-semibold">
          {isRunning && <CheckCircle className="w-3 h-3 text-emerald-400" />}
          {isCrashLoop && <AlertTriangle className="w-3 h-3 text-rose-400" />}
          {isOOM && <Skull className="w-3 h-3 text-fuchsia-400" />}
          {isPending && <Clock className="w-3 h-3 text-amber-400 animate-spin" />}
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

        {/* CPU % */}
        {isRunning && (
          <span className="text-[10px] font-mono text-cyan-300">
            CPU: {Math.round(pod.cpuUsage)}%
          </span>
        )}
      </div>

      {/* Memory usage bar */}
      {isRunning && (
        <div className="mt-1">
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                pod.memoryUsage / pod.memoryLimit > 0.85 ? 'bg-rose-500' : 'bg-blue-400'
              }`}
              style={{
                width: `${Math.min(100, Math.round((pod.memoryUsage / pod.memoryLimit) * 100))}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const TrafficCanvasOverlay: React.FC<{ packets: GameState['packets'] }> = ({ packets }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <svg className="w-full h-full">
        {packets.map((pkt) => {
          // Linear interpolation between source and target
          const currentX = pkt.sourceX + (pkt.targetX - pkt.sourceX) * pkt.progress;
          const currentY = pkt.sourceY + (pkt.targetY - pkt.sourceY) * pkt.progress;
          const isError = pkt.status === 'failed' || !pkt.targetPodId;

          return (
            <g key={pkt.id}>
              {/* Glow filter circle */}
              <circle
                cx={currentX}
                cy={currentY}
                r={isError ? 6 : 4}
                className={isError ? 'fill-rose-500/80 animate-ping' : 'fill-cyan-400/80'}
              />
              <circle
                cx={currentX}
                cy={currentY}
                r={isError ? 3.5 : 2.5}
                className={isError ? 'fill-rose-200' : 'fill-sky-100'}
              />
              {/* Error indicator text when dropped */}
              {isError && pkt.progress > 0.7 && (
                <text
                  x={currentX + 8}
                  y={currentY + 4}
                  className="fill-rose-400 text-[9px] font-mono font-bold select-none"
                >
                  503
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
