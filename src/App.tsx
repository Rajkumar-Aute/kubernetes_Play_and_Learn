import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { kubeSound } from './game/sound';
import { ytPlayables } from './services/ytPlayables';
import type { Tower, TowerType } from './game/types';
import { KubeTowerCanvas } from './components/KubeTowerCanvas';
import { WaveHUD } from './components/WaveHUD';
import { TowerShop } from './components/TowerShop';
import { TowerUpgradeModal } from './components/TowerUpgradeModal';
import { K8sLearnerCard } from './components/K8sLearnerCard';
import { KubeTowerHelpModal } from './components/KubeTowerHelpModal';

export const App: React.FC = () => {
  const engineRef = useRef<GameEngine>(new GameEngine());
  const engine = engineRef.current;

  // React state synced from engine for reactive UI renders
  const [, setTick] = useState<number>(0);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(kubeSound.getMuted());
  const [highScore, setHighScore] = useState<number>(0);

  // Re-sync UI state from engine
  const forceUpdate = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  // Sync state tick on an interval for reactive HUD numbers
  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate();
    }, 100);
    return () => clearInterval(timer);
  }, [forceUpdate]);

  // YouTube Playables SDK Lifecycle
  useEffect(() => {
    ytPlayables.notifyFirstFrameReady();
    ytPlayables.notifyGameReady();

    const unbindPause = ytPlayables.onPause(() => {
      engine.setGameSpeed(0);
      forceUpdate();
    });

    const unbindResume = ytPlayables.onResume(() => {
      engine.setGameSpeed(1);
      forceUpdate();
    });

    const unbindAudio = ytPlayables.onAudioChange((enabled) => {
      kubeSound.setMuted(!enabled);
      setIsMuted(!enabled);
      forceUpdate();
    });

    // Load saved cloud progress
    ytPlayables
      .loadGameState<{ highScore?: number; tutorialSeen?: boolean }>()
      .then((saved) => {
        if (saved?.highScore) {
          setHighScore(saved.highScore);
        }
        if (!saved?.tutorialSeen) {
          // Open help modal on very first visit
          setIsHelpOpen(true);
        }
      });

    return () => {
      unbindPause();
      unbindResume();
      unbindAudio();
    };
  }, [engine, forceUpdate]);

  // Save High Score on change
  useEffect(() => {
    if (engine.state.score > highScore) {
      setHighScore(engine.state.score);
      ytPlayables.saveGameState({ highScore: engine.state.score, tutorialSeen: true });
    }
  }, [engine.state.score, highScore]);

  // Keyboard shortcuts (1-4 for towers, Space to start wave, Esc to cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1') {
        setSelectedTowerType('pod');
        engine.selectTowerType('pod');
      } else if (e.key === '2') {
        setSelectedTowerType('service');
        engine.selectTowerType('service');
      } else if (e.key === '3') {
        setSelectedTowerType('ingress');
        engine.selectTowerType('ingress');
      } else if (e.key === '4') {
        setSelectedTowerType('hpa');
        engine.selectTowerType('hpa');
      } else if (e.key === 'Escape') {
        setSelectedTowerType(null);
        setSelectedTower(null);
        engine.selectTowerType(null);
        engine.selectTower(null);
        setIsHelpOpen(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        if (engine.state.waveStatus === 'idle') {
          engine.startWave();
          forceUpdate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, forceUpdate]);

  // Handlers
  const handleSelectTowerType = (type: TowerType | null) => {
    setSelectedTowerType(type);
    engine.selectTowerType(type);
    if (type !== null) {
      setSelectedTower(null);
    }
    forceUpdate();
  };

  const handleSelectTower = (tower: Tower | null) => {
    setSelectedTower(tower);
    engine.selectTower(tower);
    if (tower !== null) {
      setSelectedTowerType(null);
    }
    forceUpdate();
  };

  const handleStartWave = () => {
    engine.startWave();
    forceUpdate();
  };

  const handleNextWave = () => {
    engine.advanceToNextWave();
    forceUpdate();
  };

  const handleRestart = () => {
    engine.resetGame();
    setSelectedTower(null);
    setSelectedTowerType(null);
    forceUpdate();
  };

  const handleToggleMute = () => {
    const muted = kubeSound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleSpeed = () => {
    const nextSpeed = engine.state.gameSpeed === 1 ? 2 : 1;
    engine.setGameSpeed(nextSpeed);
    forceUpdate();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 selection:bg-cyan-500 selection:text-black">
      {/* Top HUD */}
      <WaveHUD
        engine={engine}
        coins={engine.state.coins}
        slaHealth={engine.state.slaHealth}
        currentWave={engine.state.currentWave}
        waveStatus={engine.state.waveStatus}
        score={engine.state.score}
        gameSpeed={engine.state.gameSpeed}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onToggleSpeed={handleToggleSpeed}
        onOpenHowToPlay={() => setIsHelpOpen(true)}
        onStartWave={handleStartWave}
      />

      {/* Main Canvas */}
      <main className="w-full flex flex-col items-center justify-center flex-1 my-auto">
        <KubeTowerCanvas engine={engine} onSelectTower={handleSelectTower} />

        {/* Tower Build Dock */}
        <TowerShop
          coins={engine.state.coins}
          selectedTowerType={selectedTowerType}
          onSelectTowerType={handleSelectTowerType}
        />
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-[1040px] mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>
          High Score: <span className="text-amber-400 font-bold">{highScore.toLocaleString()}</span>
        </div>
        <div className="hidden sm:block">
          Controls: [1-4] Build • [Click] Inspect & Scale • [Space] Deploy Wave
        </div>
        <div>YouTube Playables Edition 🛡️</div>
      </footer>

      {/* Modals & Educational Cards */}
      <TowerUpgradeModal
        tower={selectedTower}
        engine={engine}
        coins={engine.state.coins}
        onClose={() => handleSelectTower(null)}
        onActionTriggered={forceUpdate}
      />

      <K8sLearnerCard
        engine={engine}
        waveStatus={engine.state.waveStatus}
        currentWave={engine.state.currentWave}
        slaHealth={engine.state.slaHealth}
        score={engine.state.score}
        onNextWave={handleNextWave}
        onRestart={handleRestart}
      />

      <KubeTowerHelpModal
        isOpen={isHelpOpen}
        onClose={() => {
          setIsHelpOpen(false);
          ytPlayables.saveGameState({ tutorialSeen: true });
        }}
      />
    </div>
  );
};

export default App;
