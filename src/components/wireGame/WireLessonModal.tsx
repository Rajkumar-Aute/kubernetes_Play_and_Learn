import React from 'react';
import type { WireEngine } from '../../wireGame/engine';

interface WireLessonModalProps {
  engine: WireEngine;
  isOpen: boolean;
  status: string;
  onClose: () => void;
  onNextLevel: () => void;
  onRestartLevel: () => void;
}

export const WireLessonModal: React.FC<WireLessonModalProps> = ({
  engine,
  isOpen,
  status,
  onClose,
  onNextLevel,
  onRestartLevel
}) => {
  const isLevelCleared = status === 'level_cleared';
  const isGameOver = status === 'game_over';
  const isVictory = status === 'victory';

  // Only show if open OR if state ended in clear/game over/victory
  if (!isOpen && !isLevelCleared && !isGameOver && !isVictory) {
    return null;
  }

  const levelDef = engine.getCurrentLevel();

  // GAME OVER MODAL
  if (isGameOver) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-slate-900 border border-red-800/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-950 border border-red-600/60 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-red-950/50">
            💥
          </div>
          <div>
            <h2 className="text-xl font-black text-red-400 tracking-wider uppercase">
              Connection Outage!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Too many packets were misrouted or queues overflowed.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-red-900/40 text-left text-xs space-y-2 text-slate-300">
            <div className="font-bold text-red-300">💡 Why did this happen?</div>
            <p>
              In Kubernetes, if a Service is wired to mismatched Pod labels, or if traffic is
              concentrated on only 1 replica without load balancing, buffers overflow and return{' '}
              <strong className="text-red-400">503 Service Unavailable</strong> or{' '}
              <strong className="text-red-400">404 Not Found</strong>.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onRestartLevel}
              className="px-6 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-950/60 transition"
            >
              🔄 Rewire & Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ALL LEVELS BEATEN (VICTORY)
  if (isVictory) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-slate-900 border border-amber-600/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-950 border border-amber-500/60 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-950/50 animate-bounce">
            🏆
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-300 tracking-wider uppercase">
              Certified Kubernetes Network Architect!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              You mastered Ingress, Services, Replicas, Secrets, and NetworkPolicies!
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
            <div className="font-bold text-emerald-400">🎓 What You Mastered:</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-200">Labels & Selectors</strong>: How Services find
                Pod endpoints dynamically.
              </li>
              <li>
                <strong className="text-slate-200">Ingress Path Routing</strong>: URL pattern
                routing (/web vs /api).
              </li>
              <li>
                <strong className="text-slate-200">Round-Robin Replicas</strong>: Splitting load
                across multiple worker pods.
              </li>
              <li>
                <strong className="text-slate-200">NetworkPolicies</strong>: Zero-trust packet
                filtering.
              </li>
              <li>
                <strong className="text-slate-200">Canary Deployments</strong>: Weighted 80/20
                progressive delivery.
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => engine.loadLevel(1)}
              className="px-6 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-950/60 transition"
            >
              🎮 Play Again (Replay Campaign)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LEVEL CLEARED OR MANUAL INSPECT CARD
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-700/80 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isLevelCleared ? '🎉' : '📖'}</span>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                {isLevelCleared ? `${levelDef.title} Cleared!` : levelDef.title}
              </h3>
              <p className="text-xs text-indigo-400 font-mono">{levelDef.subtitle}</p>
            </div>
          </div>
          {!isLevelCleared && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Concept Card */}
        <div className="bg-slate-950/90 rounded-xl p-4 border border-indigo-900/40 space-y-3">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
            <span>💡</span>
            <span>{levelDef.k8sConceptTitle}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {levelDef.k8sConceptExplanation}
          </p>

          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200 leading-relaxed">
            <span className="font-bold text-indigo-300">Real-World Analogy: </span>
            {levelDef.k8sAnalogy}
          </div>
        </div>

        {/* Real YAML Manifest */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Real Kubernetes Manifest:</span>
            <span className="text-slate-500">manifest.yaml</span>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
            {levelDef.k8sYamlSnippet}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isLevelCleared ? (
            <button
              onClick={onNextLevel}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-950/60 transition flex items-center justify-center gap-2"
            >
              <span>Next Level (Lvl {engine.state.currentLevelId + 1})</span>
              <span>➔</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Close & Resume Wiring
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
