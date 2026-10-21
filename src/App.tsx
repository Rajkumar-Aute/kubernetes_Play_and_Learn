import React, { useState, useEffect, useRef, useCallback } from 'react';

// KubeTower Engine & Components
import { GameEngine as TowerEngine } from './game/engine';
import { kubeSound } from './game/sound';
import type { Tower, TowerType } from './game/types';
import { KubeTowerCanvas } from './components/KubeTowerCanvas';
import { WaveHUD } from './components/WaveHUD';
import { TowerShop } from './components/TowerShop';
import { TowerUpgradeModal } from './components/TowerUpgradeModal';
import { K8sLearnerCard } from './components/K8sLearnerCard';
import { KubeTowerHelpModal } from './components/KubeTowerHelpModal';

// KubeWire Engine & Components
import { WireEngine } from './wireGame/engine';
import { wireSound } from './wireGame/sound';
import { WireCanvas } from './components/wireGame/WireCanvas';
import { WireHUD } from './components/wireGame/WireHUD';
import { WireLessonModal } from './components/wireGame/WireLessonModal';

// Game Switcher & Services
import { GameSwitcher, type ActiveGame } from './components/GameSwitcher';
import { ytPlayables } from './services/ytPlayables';

export const App: React.FC = () => {
  // Current game mode: default to 'wire' as requested by the user
  const [activeGame, setActiveGame] = useState<ActiveGame>('wire');

  // --- KubeWire State ---
  const wireEngineRef = useRef<WireEngine>(new WireEngine());
  const wireEngine = wireEngineRef.current;
  const [isWireLessonOpen, setIsWireLessonOpen] = useState<boolean>(false);
  const [isWireMuted, setIsWireMuted] = useState<boolean>(wireSound.getMuted());

  // --- KubeTower State ---
  const towerEngineRef = useRef<TowerEngine>(new TowerEngine());
  const towerEngine = towerEngineRef.current;
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [isTowerHelpOpen, setIsTowerHelpOpen] = useState<boolean>(false);
  const [isTowerMuted, setIsTowerMuted] = useState<boolean>(kubeSound.getMuted());

  // Reactive Tick for UI Re-renders
  const [, setTick] = useState<number>(0);
  const forceUpdate = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

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
      towerEngine.setGameSpeed(0);
      wireEngine.setSpeed(0);
      forceUpdate();
    });

    const unbindResume = ytPlayables.onResume(() => {
      towerEngine.setGameSpeed(1);
      wireEngine.setSpeed(1);
      forceUpdate();
    });

    const unbindAudio = ytPlayables.onAudioChange((enabled) => {
      kubeSound.setMuted(!enabled);
      wireSound.setMuted(!enabled);
      setIsTowerMuted(!enabled);
      setIsWireMuted(!enabled);
      forceUpdate();
    });

    return () => {
      unbindPause();
      unbindResume();
      unbindAudio();
    };
  }, [towerEngine, wireEngine, forceUpdate]);

  // Keyboard Shortcuts for Tower Defense
  useEffect(() => {
    if (activeGame !== 'tower') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1') {
        setSelectedTowerType('pod');
        towerEngine.selectTowerType('pod');
      } else if (e.key === '2') {
        setSelectedTowerType('service');
        towerEngine.selectTowerType('service');
      } else if (e.key === '3') {
        setSelectedTowerType('ingress');
        towerEngine.selectTowerType('ingress');
      } else if (e.key === '4') {
        setSelectedTowerType('hpa');
        towerEngine.selectTowerType('hpa');
      } else if (e.key === 'Escape') {
        setSelectedTowerType(null);
        setSelectedTower(null);
        towerEngine.selectTowerType(null);
        towerEngine.selectTower(null);
        setIsTowerHelpOpen(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        if (towerEngine.state.waveStatus === 'idle') {
          towerEngine.startWave();
          forceUpdate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame, towerEngine, forceUpdate]);

  // --- KubeWire Handlers ---
  const handleToggleWireMute = () => {
    const muted = wireSound.toggleMute();
    setIsWireMuted(muted);
  };

  const handleToggleWireSpeed = () => {
    const nextSpeed = wireEngine.state.speed === 1 ? 2 : 1;
    wireEngine.setSpeed(nextSpeed);
    forceUpdate();
  };

  const handleResetWires = () => {
    wireEngine.state.wires = [];
    wireEngine.state.packets = [];
    wireEngine.state.selectedWireId = null;
    forceUpdate();
  };

  const handleNextWireLevel = () => {
    wireEngine.nextLevel();
    setIsWireLessonOpen(false);
    forceUpdate();
  };

  const handleRestartWireLevel = () => {
    wireEngine.restartCurrentLevel();
    setIsWireLessonOpen(false);
    forceUpdate();
  };

  // --- KubeTower Handlers ---
  const handleSelectTowerType = (type: TowerType | null) => {
    setSelectedTowerType(type);
    towerEngine.selectTowerType(type);
    if (type !== null) setSelectedTower(null);
    forceUpdate();
  };

  const handleSelectTower = (tower: Tower | null) => {
    setSelectedTower(tower);
    towerEngine.selectTower(tower);
    if (tower !== null) setSelectedTowerType(null);
    forceUpdate();
  };

  const handleStartWave = () => {
    towerEngine.startWave();
    forceUpdate();
  };

  const handleNextWave = () => {
    towerEngine.advanceToNextWave();
    forceUpdate();
  };

  const handleRestartTower = () => {
    towerEngine.resetGame();
    setSelectedTower(null);
    setSelectedTowerType(null);
    forceUpdate();
  };

  const handleToggleTowerMute = () => {
    const muted = kubeSound.toggleMute();
    setIsTowerMuted(muted);
  };

  const handleToggleTowerSpeed = () => {
    const nextSpeed = towerEngine.state.gameSpeed === 1 ? 2 : 1;
    towerEngine.setGameSpeed(nextSpeed);
    forceUpdate();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 selection:bg-indigo-500 selection:text-white">
      {/* Game Mode Switcher */}
      <GameSwitcher activeGame={activeGame} onSelectGame={setActiveGame} />

      {activeGame === 'wire' ? (
        /* ==================== OPTION 2: KUBEWIRE (CIRCUIT CONNECTOR) ==================== */
        <div className="w-full flex flex-col items-center flex-1 my-auto">
          {/* Wire HUD */}
          <WireHUD
            engine={wireEngine}
            currentLevelId={wireEngine.state.currentLevelId}
            deliveredCount={wireEngine.state.deliveredCount}
            targetDeliveries={wireEngine.state.targetDeliveries}
            droppedCount={wireEngine.state.droppedCount}
            maxDroppedAllowed={wireEngine.state.maxDroppedAllowed}
            wiresCount={wireEngine.state.wires.length}
            maxWires={wireEngine.getCurrentLevel().maxWires}
            speed={wireEngine.state.speed}
            isMuted={isWireMuted}
            onToggleMute={handleToggleWireMute}
            onToggleSpeed={handleToggleWireSpeed}
            onResetWires={handleResetWires}
            onOpenLesson={() => setIsWireLessonOpen(true)}
          />

          {/* Wire Canvas */}
          <WireCanvas engine={wireEngine} onSelectWire={() => forceUpdate()} />

          {/* Wire Footer */}
          <footer className="w-full max-w-[1040px] mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div>
              Level Score:{' '}
              <span className="text-indigo-400 font-bold">
                {wireEngine.state.score.toLocaleString()}
              </span>
            </div>
            <div className="hidden sm:block">
              Controls: Click & Drag to connect wires • Click wire to select & cut
            </div>
            <div>YouTube Playables Edition 🔌</div>
          </footer>

          {/* Wire Lesson / Win / Loss Modal */}
          <WireLessonModal
            engine={wireEngine}
            isOpen={isWireLessonOpen}
            status={wireEngine.state.status}
            onClose={() => setIsWireLessonOpen(false)}
            onNextLevel={handleNextWireLevel}
            onRestartLevel={handleRestartWireLevel}
          />
        </div>
      ) : (
        /* ==================== OPTION 1: KUBETOWER (TOWER DEFENSE) ==================== */
        <div className="w-full flex flex-col items-center flex-1 my-auto">
          {/* Tower HUD */}
          <WaveHUD
            engine={towerEngine}
            coins={towerEngine.state.coins}
            slaHealth={towerEngine.state.slaHealth}
            currentWave={towerEngine.state.currentWave}
            waveStatus={towerEngine.state.waveStatus}
            score={towerEngine.state.score}
            gameSpeed={towerEngine.state.gameSpeed}
            isMuted={isTowerMuted}
            onToggleMute={handleToggleTowerMute}
            onToggleSpeed={handleToggleTowerSpeed}
            onOpenHowToPlay={() => setIsTowerHelpOpen(true)}
            onStartWave={handleStartWave}
          />

          {/* Tower Canvas */}
          <KubeTowerCanvas engine={towerEngine} onSelectTower={handleSelectTower} />

          {/* Tower Build Dock */}
          <TowerShop
            coins={towerEngine.state.coins}
            selectedTowerType={selectedTowerType}
            onSelectTowerType={handleSelectTowerType}
          />

          {/* Tower Footer */}
          <footer className="w-full max-w-[1040px] mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div>
              Score:{' '}
              <span className="text-amber-400 font-bold">
                {towerEngine.state.score.toLocaleString()}
              </span>
            </div>
            <div className="hidden sm:block">
              Controls: [1-4] Build • [Click] Inspect & Scale • [Space] Deploy Wave
            </div>
            <div>YouTube Playables Edition 🛡️</div>
          </footer>

          {/* Tower Modals */}
          <TowerUpgradeModal
            tower={selectedTower}
            engine={towerEngine}
            coins={towerEngine.state.coins}
            onClose={() => handleSelectTower(null)}
            onActionTriggered={forceUpdate}
          />

          <K8sLearnerCard
            engine={towerEngine}
            waveStatus={towerEngine.state.waveStatus}
            currentWave={towerEngine.state.currentWave}
            slaHealth={towerEngine.state.slaHealth}
            score={towerEngine.state.score}
            onNextWave={handleNextWave}
            onRestart={handleRestartTower}
          />

          <KubeTowerHelpModal
            isOpen={isTowerHelpOpen}
            onClose={() => setIsTowerHelpOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default App;
