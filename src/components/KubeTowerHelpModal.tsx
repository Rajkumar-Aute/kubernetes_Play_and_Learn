import React from 'react';

interface KubeTowerHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KubeTowerHelpModal: React.FC<KubeTowerHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">
                How to Play: KubeTower
              </h2>
              <p className="text-xs text-slate-400">
                Master Kubernetes architecture through arcade defense!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* The Goal */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-900/40 space-y-1.5">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span> The Cluster Defense Objective
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Traffic packets enter from the{' '}
            <strong className="text-purple-300">Ingress Gateway</strong> (left) and travel down the
            circuit wire toward your{' '}
            <strong className="text-emerald-300">Production Database Core</strong> (right). If
            unprocessed packets breach the database, your <strong>Cluster SLA</strong> drops. Defend
            the cluster and keep SLA above 0%!
          </p>
        </div>

        {/* The 4 Towers */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Deployable Kubernetes Components:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Pod */}
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-cyan-800/50 space-y-1">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <span>📦</span> Pod Tower (🪙100)
              </div>
              <p className="text-[11px] text-slate-400">
                Primary computing worker. Fires laser beams to process requests into HTTP 200 OK.
              </p>
            </div>

            {/* Service */}
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-blue-800/50 space-y-1">
              <div className="font-bold text-blue-300 flex items-center gap-1.5">
                <span>🔄</span> Service Tower (🪙150)
              </div>
              <p className="text-[11px] text-slate-400">
                Load balancer. Emits a round-robin aura that slows down enemy packets by 45%!
              </p>
            </div>

            {/* Ingress */}
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-purple-800/50 space-y-1">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <span>🚪</span> Ingress Gateway (🪙180)
              </div>
              <p className="text-[11px] text-slate-400">
                Place near the entrance! Decrypts SSL packets and weakens enemy armor.
              </p>
            </div>

            {/* HPA */}
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-emerald-800/50 space-y-1">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <span>⚡</span> HPA Autoscaler (🪙250)
              </div>
              <p className="text-[11px] text-slate-400">
                Radar dish that boosts attack speed of all nearby Pods by 50%!
              </p>
            </div>
          </div>
        </div>

        {/* Upgrades */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚙️</span> Clicking a Deployed Tower Opens Upgrades:
          </div>
          <ul className="text-xs space-y-1.5 text-slate-300">
            <li>
              <strong className="text-cyan-300">Scale Replicas:</strong> Adds extra laser cannons
              so a single Pod can shoot 2, 3, or 4 enemies at the same time! (Real K8s:{' '}
              <code className="text-cyan-400 font-mono">kubectl scale</code>)
            </li>
            <li>
              <strong className="text-purple-300">Tune Limits (RAM):</strong> Increases memory
              ceiling to handle heavy API POST packets without crashes!
            </li>
            <li>
              <strong className="text-emerald-300">Rollout v2.0:</strong> Ships modern hyper-laser
              code live with zero cluster downtime!
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/60 transition"
          >
            🚀 Let's Defend the Cluster!
          </button>
        </div>
      </div>
    </div>
  );
};
