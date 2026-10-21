import React from 'react';

export type ActiveGame = 'tower' | 'wire';

interface GameSwitcherProps {
  activeGame: ActiveGame;
  onSelectGame: (game: ActiveGame) => void;
}

export const GameSwitcher: React.FC<GameSwitcherProps> = ({ activeGame, onSelectGame }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shadow-lg">
        <button
          onClick={() => onSelectGame('wire')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeGame === 'wire'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/60 ring-1 ring-indigo-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span className="text-base">🔌</span>
          <span>KubeWire (Circuit Connector)</span>
          {activeGame === 'wire' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          )}
        </button>

        <button
          onClick={() => onSelectGame('tower')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeGame === 'tower'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span className="text-base">🛡️</span>
          <span>KubeTower (Tower Defense)</span>
          {activeGame === 'tower' && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
