import React from 'react';
import { TOWER_CONFIGS } from '../game/constants';
import type { TowerType } from '../game/types';

interface TowerShopProps {
  coins: number;
  selectedTowerType: TowerType | null;
  onSelectTowerType: (type: TowerType | null) => void;
}

const TOWER_ICONS: Record<TowerType, { icon: string; border: string; bg: string }> = {
  pod: { icon: '📦', border: 'border-cyan-500/50', bg: 'bg-cyan-950/40' },
  service: { icon: '🔄', border: 'border-blue-500/50', bg: 'bg-blue-950/40' },
  ingress: { icon: '🚪', border: 'border-purple-500/50', bg: 'bg-purple-950/40' },
  hpa: { icon: '⚡', border: 'border-emerald-500/50', bg: 'bg-emerald-950/40' }
};

export const TowerShop: React.FC<TowerShopProps> = ({
  coins,
  selectedTowerType,
  onSelectTowerType
}) => {
  const towerTypes: TowerType[] = ['pod', 'service', 'ingress', 'hpa'];

  return (
    <div className="w-full max-w-[1040px] mx-auto mt-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Build Dock:
          </span>
          {selectedTowerType ? (
            <span className="text-xs text-cyan-300 font-mono animate-pulse">
              Click any open grid cell to deploy {TOWER_CONFIGS[selectedTowerType].name}!
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              Select a Kubernetes component to deploy onto the cluster
            </span>
          )}
        </div>

        {selectedTowerType && (
          <button
            onClick={() => onSelectTowerType(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition"
          >
            Cancel Selection (Esc)
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
        {towerTypes.map((type) => {
          const config = TOWER_CONFIGS[type];
          const canAfford = coins >= config.cost;
          const isSelected = selectedTowerType === type;
          const style = TOWER_ICONS[type];

          return (
            <button
              key={type}
              disabled={!canAfford && !isSelected}
              onClick={() => onSelectTowerType(isSelected ? null : type)}
              className={`relative flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/70 ring-2 ring-cyan-400 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                  : canAfford
                  ? `${style.border} ${style.bg} hover:border-slate-500 hover:bg-slate-800/80`
                  : 'border-slate-800/60 bg-slate-900/40 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="text-2xl flex-shrink-0">{style.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200 truncate">{config.name}</div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      canAfford ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    🪙{config.cost}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{config.k8sRole}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
