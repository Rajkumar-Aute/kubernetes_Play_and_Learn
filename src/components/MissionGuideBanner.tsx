import React from 'react';
import { Target, HelpCircle, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
import type { GameState, Level } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface MissionGuideBannerProps {
  level: Level;
  state: GameState;
  onOpenHowToPlay: () => void;
  onOpenBriefing: () => void;
}

export const MissionGuideBanner: React.FC<MissionGuideBannerProps> = ({
  level,
  state,
  onOpenHowToPlay,
  onOpenBriefing
}) => {
  // Compute contextual current instruction based on level and cluster state
  const getContextualInstruction = () => {
    const runningPods = state.pods.filter((p) => p.status === 'Running').length;
    const dep = state.deployments[0];
    const svc = state.services[0];
    const hasOOM = state.pods.some((p) => p.status === 'OOMKilled');

    switch (level.id) {
      case 1:
        if (runningPods === 0) {
          return {
            step: 'Step 1 of 2',
            action: 'Click "+ Scale 1" button below (or type `kubectl scale deployment web --replicas=1`) to deploy your first Pod!',
            why: 'In Kubernetes, you cannot run bare containers directly—they must be packaged and scheduled inside Pods.',
            highlightBtn: 'scale',
            isComplete: false
          };
        }
        return {
          step: 'Step 2 of 2',
          action: `Pod is Running! Now watch traffic flow into the Pod (${state.successfulRequests} / 10 requests served).`,
          why: 'The Ingress and Service automatically route incoming HTTP requests to your ready Pod.',
          highlightBtn: 'none',
          isComplete: state.successfulRequests >= 10
        };

      case 2:
        if (runningPods < 3) {
          return {
            step: 'Step 1 of 2',
            action: 'Traffic spiked to 30 req/s! Click "+ Scale 1" until you have at least 3 Replicas running.',
            why: 'A single Pod is a Single Point of Failure (SPOF). Deployments manage ReplicaSets to keep multiple identical copies running.',
            highlightBtn: 'scale',
            isComplete: false
          };
        }
        return {
          step: 'Step 2 of 2',
          action: `Great! 3 Replicas running. Maintain SLA > 90% while serving traffic (${state.successfulRequests} / 30 requests).`,
          why: 'Traffic is balanced across all 3 pods, keeping CPU usage low and preventing dropped packets.',
          highlightBtn: 'none',
          isComplete: state.successfulRequests >= 30 && state.sla >= 90
        };

      case 3:
        if (svc?.selector['app'] !== 'web') {
          return {
            step: 'Step 1 of 2',
            action: 'Pod IPs change when they restart! Click "Link Service" (or run `kubectl apply -f service.yaml`) to connect selector app: web.',
            why: 'A Kubernetes Service provides a permanent ClusterIP and uses label selectors to dynamically route to matching Pods.',
            highlightBtn: 'service',
            isComplete: false
          };
        }
        return {
          step: 'Step 2 of 2',
          action: `Service connected! Routing traffic across Pods (${state.successfulRequests} / 25 requests).`,
          why: 'The Service uses round-robin load balancing to distribute traffic among all matching ready endpoints.',
          highlightBtn: 'none',
          isComplete: state.successfulRequests >= 25
        };

      case 4:
        if (!dep?.env['DB_HOST']) {
          return {
            step: 'Step 1 of 2',
            action: 'The Pod is in CrashLoopBackOff! Click the red pod to inspect logs, then click "Fix DB_HOST" to inject config.',
            why: 'CrashLoopBackOff means the container died immediately after boot. Checking `kubectl logs` reveals missing configuration like DB_HOST.',
            highlightBtn: 'env',
            isComplete: false
          };
        }
        return {
          step: 'Step 2 of 2',
          action: 'DB_HOST injected! The pod recovered and is now serving API traffic.',
          why: 'ConfigMaps and Secrets decouple application code from environment credentials and URLs.',
          highlightBtn: 'none',
          isComplete: true
        };

      case 5:
        if (hasOOM || (dep && dep.memoryLimit < 256)) {
          return {
            step: 'Step 1 of 2',
            action: 'Container exceeded memory limit (Exit Code 137 OOMKilled)! Click "Fix OOM" to increase limit to 256MiB.',
            why: 'Unlike CPU (which is throttled), exceeding memory limits causes the Linux kernel OOM Killer to immediately kill the process.',
            highlightBtn: 'limits',
            isComplete: false
          };
        }
        return {
          step: 'Step 2 of 2',
          action: `Cluster stabilized with 256MiB limit (${state.successfulRequests} / 30 requests).`,
          why: 'Always configure appropriate memory limits with sufficient headroom for peak traffic payloads.',
          highlightBtn: 'none',
          isComplete: state.successfulRequests >= 30
        };

      case 6:
        if (dep?.version !== 'v2.0') {
          return {
            step: 'Step 1 of 2',
            action: 'Engineering finished Version 2.0! Click "Rollout v2" to trigger a zero-downtime rolling update.',
            why: 'Kubernetes starts new v2 pods, waits for Readiness Probes to pass, switches traffic, and only then terminates v1 pods.',
            highlightBtn: 'rollout',
            isComplete: false
          };
        }
        return {
          step: 'Step 2 of 2',
          action: `Rolling update complete! All pods running v2.0 with 0 dropped requests (${state.successfulRequests} / 40).`,
          why: 'Readiness probes prevent traffic from reaching warming-up containers, guaranteeing zero 502/503 errors.',
          highlightBtn: 'none',
          isComplete: state.successfulRequests >= 40 && state.sla >= 98
        };

      case 7:
        if (runningPods < 4) {
          return {
            step: 'Step 1 of 2',
            action: 'Worker Node-2 experienced power failure! Watch Kube-Scheduler automatically reschedule pods onto healthy nodes.',
            why: 'The node controller detects missing kubelet heartbeats, marks the node NotReady, and triggers self-healing rescheduling.',
            highlightBtn: 'node',
            isComplete: false
          };
        }
        return {
          step: 'Step 2 of 2',
          action: `Resilience achieved! Cluster self-healed on surviving nodes (${state.successfulRequests} / 50 requests).`,
          why: 'Kubernetes declarative desired state ensures lost pods are automatically recreated elsewhere in the cluster.',
          highlightBtn: 'none',
          isComplete: state.successfulRequests >= 50 && state.sla >= 92
        };

      case 8:
        if (!dep?.hpaEnabled) {
          return {
            step: 'Step 1 of 2',
            action: 'Flash traffic waves incoming! Click "Enable HPA" to turn on Horizontal Pod Autoscaling.',
            why: 'HPA queries the Metrics Server every 15s and dynamically calculates desired replicas based on average CPU utilization.',
            highlightBtn: 'hpa',
            isComplete: false
          };
        }
        return {
          step: 'Step 2 of 2',
          action: `HPA Active! Watch pods dynamically scale out during traffic peaks and scale in during quiet periods (${state.successfulRequests} / 100).`,
          why: 'Autoscaling saves cloud infrastructure costs while preventing outages during unexpected surges.',
          highlightBtn: 'none',
          isComplete: state.successfulRequests >= 100 && state.sla >= 94
        };

      default:
        return {
          step: 'Goal',
          action: 'Manage traffic and keep SLA above 95%!',
          why: 'Balance cluster resources effectively.',
          highlightBtn: 'none',
          isComplete: false
        };
    }
  };

  const instruction = getContextualInstruction();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-cyan-800/80 rounded-xl p-3 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 select-none">
      {/* Left: Current Step & Action */}
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/80 tracking-wider">
            <Target className="w-3 h-3 text-cyan-400" />
            {instruction.step}
          </span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenBriefing();
            }}
            className="text-xs font-bold text-white hover:text-cyan-300 tracking-wide transition text-left cursor-pointer"
            title="Click to view detailed briefing and hints"
          >
            Mission {level.id}: {level.name}
          </button>
        </div>

        {/* Clear Action Instruction */}
        <p className="text-xs sm:text-sm font-semibold text-cyan-100 flex items-start gap-1.5 leading-snug">
          <span className="text-cyan-400 mt-0.5">👉</span>
          <span>{instruction.action}</span>
        </p>

        {/* Educational Note: The "Why" */}
        <div className="flex items-start gap-1.5 text-[11px] text-slate-400 pt-0.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-300">What you learn: </strong>
            {instruction.why}
          </span>
        </div>
      </div>

      {/* Right: Objectives Progress & Help button */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
        {/* Objectives Progress Pills */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono space-y-1">
          {level.objectives.map((obj) => {
            const done = obj.isCompleted(state);
            return (
              <div key={obj.id} className="flex items-center gap-1.5">
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className={done ? 'text-emerald-300' : 'text-slate-400'}>
                  {obj.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* How to Play Guide Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenHowToPlay();
          }}
          className="px-2.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md glow-cyan flex items-center gap-1.5 transition"
          title="Open How to Play Guide"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Guide</span>
        </button>
      </div>
    </div>
  );
};
