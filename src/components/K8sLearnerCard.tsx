import React from 'react';
import { WAVES } from '../game/constants';
import type { GameEngine } from '../game/engine';

interface K8sLearnerCardProps {
  engine: GameEngine;
  waveStatus: string;
  currentWave: number;
  slaHealth: number;
  score: number;
  onNextWave: () => void;
  onRestart: () => void;
}

export const K8sLearnerCard: React.FC<K8sLearnerCardProps> = ({
  engine,
  waveStatus,
  currentWave,
  slaHealth,
  score,
  onNextWave,
  onRestart
}) => {
  if (waveStatus !== 'wave_cleared' && waveStatus !== 'game_over' && waveStatus !== 'victory') {
    return null;
  }

  const waveDef = WAVES[currentWave - 1] || WAVES[0];

  // GAME OVER
  if (waveStatus === 'game_over') {
    return (
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-slate-900 border border-red-800/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-950 border border-red-600/60 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-red-950/50">
            💥
          </div>
          <div>
            <h2 className="text-xl font-black text-red-400 tracking-wider uppercase">
              Cluster Outage! (SLA: 0%)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Unhandled HTTP requests crashed the Database Core.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-red-900/40 text-left text-xs space-y-2 text-slate-300">
            <div className="font-bold text-red-300">💡 Fresher DevOps Lesson:</div>
            <p>
              In production, if your Pods lack replicas or memory limits, high-volume traffic bursts
              will leak straight to backend databases and bring down the entire company.
            </p>
            <div className="font-mono text-[11px] text-cyan-400 bg-slate-900 p-2 rounded border border-slate-800">
              $ kubectl get events --sort-by='.metadata.creationTimestamp'
              <br />
              <span className="text-red-400">Warning: FailedScheduling - 0/3 nodes available</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onRestart}
              className="px-6 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-950/60 transition"
            >
              🔄 Re-deploy Cluster & Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VICTORY (Wave 8 beaten)
  if (waveStatus === 'victory') {
    return (
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-slate-900 border border-amber-600/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-950 border border-amber-500/60 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-950/50 animate-bounce">
            🏆
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-300 tracking-wider uppercase">
              Production Certified! You Won!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              You defeated the Black Friday Mega Wave without dropping SLA!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-amber-900/40 text-center font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Final Score</div>
              <div className="text-base font-black text-amber-400">{score.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Enemies Cleared</div>
              <div className="text-base font-black text-cyan-400">
                {engine.state.stats.enemiesDefeated}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Pods Built</div>
              <div className="text-base font-black text-emerald-400">
                {engine.state.stats.podsBuilt}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
            <div className="font-bold text-emerald-400">🎓 What You Mastered:</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-200">Pods</strong>: Deploying and running container
                workloads.
              </li>
              <li>
                <strong className="text-slate-200">Replicas</strong>: Scaling multiple instances
                with <code className="text-cyan-400">kubectl scale</code>.
              </li>
              <li>
                <strong className="text-slate-200">Resource Limits</strong>: Memory tuning to
                prevent OOMKilled crashes.
              </li>
              <li>
                <strong className="text-slate-200">Services & Ingress</strong>: Load balancing and
                SSL decryption at the front door.
              </li>
              <li>
                <strong className="text-slate-200">HPA</strong>: Dynamic horizontal autoscaling
                under peak traffic.
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onRestart}
              className="px-6 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-950/60 transition"
            >
              🎮 Play Again (New High Score)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WAVE CLEARED CARD
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        {/* Banner */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                Wave {currentWave} Cleared!
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  SLA: {slaHealth}%
                </span>
              </h3>
              <p className="text-xs text-amber-400 font-mono">
                Bonus: +{waveDef.rewardBonus} 🪙 Cloud Coins
              </p>
            </div>
          </div>
        </div>

        {/* Educational Concept Card */}
        <div className="bg-slate-950/90 rounded-xl p-4 border border-cyan-900/40 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
            <span>💡</span>
            <span>Kubernetes Concept: {waveDef.k8sLessonTitle}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{waveDef.k8sLessonText}</p>

          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 leading-relaxed">
            <span className="font-bold text-cyan-300">Real-World Analogy: </span>
            {waveDef.k8sAnalogy}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onNextWave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/60 transition flex items-center justify-center gap-2"
          >
            <span>Proceed to Wave {currentWave + 1}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
