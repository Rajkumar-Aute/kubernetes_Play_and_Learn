import React from 'react';
import type { GameEngine } from '../game/engine';
import type { Tower } from '../game/types';

interface TowerUpgradeModalProps {
  tower: Tower | null;
  engine: GameEngine;
  coins: number;
  onClose: () => void;
  onActionTriggered: () => void;
}

export const TowerUpgradeModal: React.FC<TowerUpgradeModalProps> = ({
  tower,
  engine,
  coins,
  onClose,
  onActionTriggered
}) => {
  if (!tower) return null;

  const isPod = tower.type === 'pod';

  // Replica upgrade cost & feasibility
  const nextReplicaCost = 100 * tower.replicas;
  const canScaleReplica = isPod && tower.replicas < 4 && coins >= nextReplicaCost;

  // Memory limit upgrade cost & feasibility
  const nextMemCost = 80 * (tower.memoryLimit / 64);
  const canTuneMemory = isPod && tower.memoryLimit < 512 && coins >= nextMemCost;

  // Rollout v2.0 cost & feasibility
  const rolloutCost = 180;
  const canRollout = isPod && tower.version !== 'v2.0' && coins >= rolloutCost;

  // Support tower aura upgrade
  const supportUpgradeCost = 120 * tower.level;
  const canUpgradeSupport = !isPod && tower.level < 3 && coins >= supportUpgradeCost;

  // Sell refund
  const refundAmount = Math.floor(tower.totalInvested * 0.7);

  const handleScaleReplicas = () => {
    if (engine.scaleReplicas(tower.id)) {
      onActionTriggered();
    }
  };

  const handleTuneMemory = () => {
    if (engine.tuneMemoryLimits(tower.id)) {
      onActionTriggered();
    }
  };

  const handleRolloutV2 = () => {
    if (engine.rolloutV2(tower.id)) {
      onActionTriggered();
    }
  };

  const handleUpgradeSupport = () => {
    if (engine.upgradeSupportTower(tower.id)) {
      onActionTriggered();
    }
  };

  const handleSell = () => {
    if (engine.sellTower(tower.id)) {
      onClose();
      onActionTriggered();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {tower.type === 'pod'
                ? '📦'
                : tower.type === 'service'
                ? '🔄'
                : tower.type === 'ingress'
                ? '🚪'
                : '⚡'}
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {tower.name}{' '}
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  {tower.version} • Lvl {tower.level}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Grid: [{tower.col}, {tower.row}] • Invested: 🪙{tower.totalInvested}
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

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 font-mono text-center">
          <div>
            <div className="text-[10px] uppercase text-slate-400">Damage</div>
            <div className="text-sm font-bold text-rose-400">{tower.damage} DPS</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400">Range</div>
            <div className="text-sm font-bold text-sky-400">{tower.range} px</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400">
              {isPod ? 'Replicas' : 'Aura Boost'}
            </div>
            <div className="text-sm font-bold text-emerald-400">
              {isPod ? `${tower.replicas} Cannons` : `Lvl ${tower.level}`}
            </div>
          </div>
        </div>

        {/* Upgrades Section */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Kubernetes Upgrades:
          </div>

          {isPod ? (
            <>
              {/* Scale Replicas */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    🚀 Scale Replicas ({tower.replicas}/4)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Adds +1 simultaneous laser cannon to shoot multiple targets!
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    kubectl scale deployment --replicas={tower.replicas + 1}
                  </div>
                </div>
                <button
                  disabled={!canScaleReplica}
                  onClick={handleScaleReplicas}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex-shrink-0 ${
                    tower.replicas >= 4
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : canScaleReplica
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/50'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {tower.replicas >= 4 ? 'MAX' : `🪙${nextReplicaCost}`}
                </button>
              </div>

              {/* Tune Memory Limits */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    🧠 Tune Memory Limits ({tower.memoryLimit} MiB)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Prevents OOM crash & deals +40% bonus against heavy POST packets!
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    resources.limits.memory: {tower.memoryLimit * 2}Mi
                  </div>
                </div>
                <button
                  disabled={!canTuneMemory}
                  onClick={handleTuneMemory}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex-shrink-0 ${
                    tower.memoryLimit >= 512
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : canTuneMemory
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/50'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {tower.memoryLimit >= 512 ? 'MAX' : `🪙${nextMemCost}`}
                </button>
              </div>

              {/* Rollout v2.0 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    ✨ Zero-Downtime Rollout v2.0
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Upgrades base damage to hyper-lasers with 0 cluster downtime!
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    kubectl set image deployment app=v2.0
                  </div>
                </div>
                <button
                  disabled={!canRollout}
                  onClick={handleRolloutV2}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex-shrink-0 ${
                    tower.version === 'v2.0'
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : canRollout
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/50'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {tower.version === 'v2.0' ? 'DEPLOYED' : `🪙${rolloutCost}`}
                </button>
              </div>
            </>
          ) : (
            /* Support Tower Upgrades */
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  📡 Expand Aura Radius & Potency (Lvl {tower.level}/3)
                </div>
                <div className="text-[11px] text-slate-400">
                  Increases aura coverage range (+25px) and boosts support effect.
                </div>
              </div>
              <button
                disabled={!canUpgradeSupport}
                onClick={handleUpgradeSupport}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex-shrink-0 ${
                  tower.level >= 3
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : canUpgradeSupport
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {tower.level >= 3 ? 'MAX' : `🪙${supportUpgradeCost}`}
              </button>
            </div>
          )}
        </div>

        {/* Sell / Decommission Button */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            kubectl delete {tower.type} {tower.id}
          </div>
          <button
            onClick={handleSell}
            className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-900/60 hover:text-white transition"
          >
            Decommission (Sell for 🪙{refundAmount})
          </button>
        </div>
      </div>
    </div>
  );
};
