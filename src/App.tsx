import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, GameMode, Pod } from './types/game';
import { LEVELS } from './data/levels';
import { k8sEngine } from './services/k8sEngine';
import { soundEngine } from './services/soundEngine';
import { ytPlayables } from './services/ytPlayables';

import { Navbar } from './components/Navbar';
import { ClusterCanvas } from './components/ClusterCanvas';
import { ControlPanel } from './components/ControlPanel';
import { KubectlTerminal } from './components/KubectlTerminal';
import { YamlViewer } from './components/YamlViewer';
import { LevelModal } from './components/LevelModal';
import { GlossaryModal } from './components/GlossaryModal';
import { PodInspectorModal } from './components/PodInspectorModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { InteractiveMentor } from './components/InteractiveMentor';
import { MISSION_TUTORIALS } from './data/interactiveTutorials';

export const App: React.FC = () => {
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [mode, setMode] = useState<GameMode>('campaign');
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [activeTab, setActiveTab] = useState<'terminal' | 'yaml'>('terminal');

  // Modals state
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(true);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [inspectedPod, setInspectedPod] = useState<Pod | null>(null);

  const initialLevel = LEVELS[0];

  const [gameState, setGameState] = useState<GameState>({
    mode: 'campaign',
    currentLevelId: 1,
    isPaused: false,
    gameSpeed: 1,
    score: 0,
    highScore: 0,
    uptimeSeconds: 0,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    sla: 100,
    nodes: initialLevel.initialState.nodes || [],
    deployments: initialLevel.initialState.deployments || [],
    pods: initialLevel.initialState.pods || [],
    services: initialLevel.initialState.services || [],
    ingress: initialLevel.initialState.ingress || {
      name: 'main-ingress',
      rules: [],
      enabled: true
    },
    packets: [],
    trafficRate: initialLevel.initialState.trafficRate || 4,
    trafficSpikeActive: false,
    chaosActive: false,
    isAutoTraffic: false,
    terminalHistory: [
      { text: '$ cluster initialized: kubedefender-v1.30', type: 'output' },
      { text: '$ type `kubectl help` or use the suggestions below to interact', type: 'output' }
    ]
  });

  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;
  const lastTimeRef = useRef<number>(performance.now());
  const levelCompletedRef = useRef<boolean>(false);

  // Initialize YouTube Playables SDK
  useEffect(() => {
    ytPlayables.notifyFirstFrameReady();
    ytPlayables.notifyGameReady();

    // Hook pause/resume from YouTube Playables
    const unbindPause = ytPlayables.onPause(() => {
      setGameState((prev) => ({ ...prev, isPaused: true }));
    });
    const unbindResume = ytPlayables.onResume(() => {
      setGameState((prev) => ({ ...prev, isPaused: false }));
    });
    const unbindAudio = ytPlayables.onAudioChange((enabled) => {
      setIsMuted(!enabled);
      soundEngine.setMuted(!enabled);
    });

    // Load saved high score
    ytPlayables.loadGameState<{ highScore: number }>().then((saved) => {
      if (saved?.highScore) {
        setGameState((prev) => ({ ...prev, highScore: saved.highScore }));
      }
    });

    return () => {
      unbindPause();
      unbindResume();
      unbindAudio();
    };
  }, []);

  // Reset or Switch Level
  const loadLevel = useCallback((levelId: number, targetMode: GameMode = 'campaign') => {
    const targetLvl = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    levelCompletedRef.current = false;
    setIsVictoryOpen(false);
    setIsBriefingOpen(targetMode === 'campaign');
    setCurrentLevelId(levelId);
    setMode(targetMode);

    setGameState((prev) => {
      const cloned = JSON.parse(JSON.stringify(targetLvl.initialState));
      return {
        ...prev,
        mode: targetMode,
        currentLevelId: levelId,
        isPaused: false,
        score: targetMode === 'survival' ? 0 : prev.score,
        uptimeSeconds: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        sla: 100,
        nodes: cloned.nodes || [],
        deployments: cloned.deployments || [],
        pods: cloned.pods || [],
        services: cloned.services || [],
        ingress: cloned.ingress || { name: 'main-ingress', rules: [], enabled: true },
        packets: [],
        trafficRate: targetMode === 'survival' ? 30 : cloned.trafficRate || 5,
        chaosActive: targetMode === 'survival',
        activeChaosEvent: targetMode === 'survival' ? 'High Traffic Stress' : cloned.activeChaosEvent,
        isAutoTraffic: targetMode === 'survival' ? true : cloned.isAutoTraffic !== undefined ? cloned.isAutoTraffic : true,
        terminalHistory: [
          { text: `$ switched context to mission-${levelId}`, type: 'output' },
          { text: `$ mission: ${targetLvl.name} - ${targetLvl.k8sConcept}`, type: 'output' }
        ],
        selectedPodId: undefined,
        selectedNodeId: undefined
      };
    });
  }, []);

  // Main simulation tick loop
  useEffect(() => {
    let animId: number;

    const loop = (now: number) => {
      const deltaSec = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      setGameState((prevState) => {
        const nextState = k8sEngine.tick(prevState, deltaSec * prevState.gameSpeed);

        // Check level objectives in campaign mode
        if (nextState.mode === 'campaign' && !levelCompletedRef.current) {
          const currentLevel = LEVELS.find((l) => l.id === nextState.currentLevelId);
          if (currentLevel) {
            const allDone = currentLevel.objectives.every((obj) => obj.isCompleted(nextState));
            if (allDone) {
              levelCompletedRef.current = true;
              setIsVictoryOpen(true);
              ytPlayables.submitScore(nextState.score);
              ytPlayables.saveGameState({ highScore: nextState.highScore, levelCompleted: currentLevel.id });
            }
          }
        }

        return nextState;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Actions
  const handleScale = (delta: number) => {
    setGameState((prev) => {
      const dep = prev.deployments[0];
      if (!dep) return prev;
      const newDesired = Math.max(0, Math.min(8, dep.desiredReplicas + delta));
      const updatedDeps = prev.deployments.map((d) =>
        d.name === dep.name ? { ...d, desiredReplicas: newDesired } : d
      );

      return {
        ...prev,
        deployments: updatedDeps,
        terminalHistory: [
          ...prev.terminalHistory,
          { text: `$ kubectl scale deployment ${dep.name} --replicas=${newDesired}`, type: 'cmd' },
          { text: `deployment.apps/${dep.name} scaled to ${newDesired}`, type: 'success' }
        ]
      };
    });
  };

  const handleRolloutV2 = () => {
    setGameState((prev) => {
      const dep = prev.deployments[0];
      if (!dep) return prev;

      const updatedDeps = prev.deployments.map((d) =>
        d.name === dep.name ? { ...d, version: 'v2.0', image: 'web-app:2.0' } : d
      );

      // Upgrade pods with rolling restart
      const updatedPods = prev.pods.map((p) => ({
        ...p,
        version: 'v2.0',
        logs: [...p.logs, 'Rolling update: container restarted with image web-app:2.0']
      }));

      soundEngine.playDeploy();

      return {
        ...prev,
        deployments: updatedDeps,
        pods: updatedPods,
        terminalHistory: [
          ...prev.terminalHistory,
          { text: `$ kubectl set image deployment ${dep.name} ${dep.name}=web-app:2.0`, type: 'cmd' },
          { text: `deployment.apps/${dep.name} image updated to web-app:2.0`, type: 'success' }
        ]
      };
    });
  };

  const handleFixEnv = () => {
    setGameState((prev) => {
      const dep = prev.deployments[0];
      if (!dep) return prev;

      const updatedDeps = prev.deployments.map((d) =>
        d.name === dep.name ? { ...d, env: { ...d.env, DB_HOST: 'postgres-cluster.default.svc' } } : d
      );

      const updatedPods = prev.pods.map((p) => {
        if (p.deploymentName === dep.name) {
          return {
            ...p,
            env: { ...p.env, DB_HOST: 'postgres-cluster.default.svc' },
            status: 'Running' as const,
            ready: true,
            logs: [
              ...p.logs,
              '[Startup] DB_HOST injected successfully!',
              '[DB Connector] Connected to postgres-cluster.default.svc:5432',
              'Pod is now Ready and serving traffic.'
            ]
          };
        }
        return p;
      });

      soundEngine.playDeploy();

      return {
        ...prev,
        deployments: updatedDeps,
        pods: updatedPods,
        terminalHistory: [
          ...prev.terminalHistory,
          { text: `$ kubectl set env deployment ${dep.name} DB_HOST=postgres-cluster`, type: 'cmd' },
          { text: `config injected. Pod resolved CrashLoopBackOff.`, type: 'success' }
        ]
      };
    });
  };

  const handleIncreaseLimits = () => {
    setGameState((prev) => {
      const dep = prev.deployments[0];
      if (!dep) return prev;

      // Progressive memory step up: 64 -> 256 -> 512 -> 1024
      const nextLimit = dep.memoryLimit < 256 ? 256 : dep.memoryLimit < 512 ? 512 : 1024;

      const updatedDeps = prev.deployments.map((d) =>
        d.name === dep.name ? { ...d, memoryLimit: nextLimit, memoryRequest: Math.round(nextLimit / 2) } : d
      );

      const updatedPods = prev.pods.map((p) => {
        if (p.deploymentName === dep.name) {
          return {
            ...p,
            memoryLimit: nextLimit,
            memoryRequest: Math.round(nextLimit / 2),
            memoryUsage: 45, // Reset memory footprint to baseline so pod instantly heals
            status: 'Running' as const,
            ready: true,
            logs: [...p.logs, `Memory limit upgraded to ${nextLimit}MiB. Pod recovered from OOM.`]
          };
        }
        return p;
      });

      soundEngine.playDeploy();

      return {
        ...prev,
        deployments: updatedDeps,
        pods: updatedPods,
        terminalHistory: [
          ...prev.terminalHistory,
          { text: `$ kubectl set resources deployment ${dep.name} --limits=memory=${nextLimit}Mi`, type: 'cmd' },
          { text: `resource limits updated: memory limit increased to ${nextLimit}MiB. Pods recovered!`, type: 'success' }
        ]
      };
    });
  };

  const handleFixServiceSelector = () => {
    setGameState((prev) => {
      const svc = prev.services[0];
      if (!svc) return prev;

      const updatedServices = prev.services.map((s) =>
        s.name === svc.name ? { ...s, selector: { app: 'web' } } : s
      );

      soundEngine.playDeploy();

      return {
        ...prev,
        services: updatedServices,
        terminalHistory: [
          ...prev.terminalHistory,
          { text: `$ kubectl patch svc ${svc.name} -p '{"spec":{"selector":{"app":"web"}}}'`, type: 'cmd' },
          { text: `service/${svc.name} selector updated to app=web. Endpoints connected!`, type: 'success' }
        ]
      };
    });
  };

  const handleToggleHPA = () => {
    setGameState((prev) => {
      const dep = prev.deployments[0];
      if (!dep) return prev;
      const nextHpa = !dep.hpaEnabled;

      const updatedDeps = prev.deployments.map((d) =>
        d.name === dep.name ? { ...d, hpaEnabled: nextHpa } : d
      );

      soundEngine.playClick();

      return {
        ...prev,
        deployments: updatedDeps,
        terminalHistory: [
          ...prev.terminalHistory,
          {
            text: nextHpa
              ? `$ kubectl autoscale deployment ${dep.name} --min=2 --max=7 --cpu-percent=60`
              : `$ kubectl delete hpa ${dep.name}-hpa`,
            type: 'cmd'
          },
          {
            text: nextHpa
              ? `horizontalpodautoscaler.autoscaling/${dep.name}-hpa enabled (target: 60% CPU)`
              : `horizontalpodautoscaler.autoscaling/${dep.name}-hpa deleted`,
            type: 'success'
          }
        ]
      };
    });
  };

  const handleAddNode = () => {
    setGameState((prev) => {
      if (prev.nodes.length >= 4) return prev;
      const newNodeId = `node-${prev.nodes.length + 1}`;
      const newNode = {
        id: newNodeId,
        name: `worker-node-${prev.nodes.length + 1}`,
        status: 'Ready' as const,
        cpuCapacity: 1000,
        cpuAllocated: 0,
        memoryCapacity: 1024,
        memoryAllocated: 0
      };

      soundEngine.playDeploy();

      return {
        ...prev,
        nodes: [...prev.nodes, newNode],
        terminalHistory: [
          ...prev.terminalHistory,
          { text: `$ cluster-autoscaler: provisioned new instance ${newNode.name}`, type: 'cmd' },
          { text: `node/${newNode.name} joined the cluster with Ready status.`, type: 'success' }
        ]
      };
    });
  };

  const handleTriggerChaos = () => {
    setGameState((prev) => {
      const events = [
        'Sudden Traffic Spike (100 req/s)!',
        'Node-2 Network Partition & Hardware Glitch',
        'Payload Memory Burst Attack'
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];

      let newTrafficRate = prev.trafficRate;
      const updatedNodes = [...prev.nodes];

      if (randomEvent.includes('Traffic Spike')) {
        newTrafficRate = Math.min(120, prev.trafficRate + 40);
      } else if (randomEvent.includes('Node-2') && updatedNodes[1]) {
        updatedNodes[1] = { ...updatedNodes[1], status: 'NotReady' };
      }

      soundEngine.playAlert();

      return {
        ...prev,
        chaosActive: true,
        activeChaosEvent: randomEvent,
        trafficRate: newTrafficRate,
        nodes: updatedNodes,
        terminalHistory: [
          ...prev.terminalHistory,
          { text: `[CHAOS MONKEY] Triggered: ${randomEvent}`, type: 'error' }
        ]
      };
    });
  };

  // Kubectl Command Execution Parser
  const handleExecuteCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Ensure the terminal tab is active so the player immediately sees the output
    setActiveTab('terminal');

    const lower = trimmed.toLowerCase();
    let outputText = '';
    let outputType: 'output' | 'error' | 'success' = 'output';

    if (lower === 'kubectl help' || lower === 'help') {
      outputText = `Kubectl Cheat Sheet:
  kubectl get pods               - List all pods & statuses
  kubectl get nodes              - List worker nodes & condition
  kubectl get svc                - List services & ClusterIPs
  kubectl get deploy             - List deployments & replicas
  kubectl logs <pod-name>        - Stream container logs
  kubectl describe pod <name>    - Detailed pod inspection & events
  kubectl describe node <name>   - Node health & resource capacity
  kubectl describe svc <name>    - Service endpoints & selector
  kubectl scale deployment web --replicas=<N>
  kubectl set resources deployment web --limits=memory=256Mi
  kubectl set image deployment web web=web-app:2.0
  kubectl set env deployment backend DB_HOST=postgres-cluster
  kubectl autoscale deployment web --min=2 --max=7 --cpu-percent=60
  kubectl apply -f service.yaml  - Connect service selector`;
    } else if (lower.startsWith('kubectl get pods') || lower === 'get pods') {
      const header = 'NAME                 READY   STATUS             RESTARTS   NODE';
      const rows = gameState.pods.map(
        (p) =>
          `${p.name.padEnd(20)} ${p.ready ? '1/1' : '0/1'}     ${p.status.padEnd(18)} ${p.restarts.toString().padEnd(10)} ${p.nodeId}`
      );
      outputText = [header, ...rows].join('\n');
    } else if (lower.startsWith('kubectl get nodes') || lower === 'get nodes') {
      const header = 'NAME             STATUS     ROLES    AGE    VERSION';
      const rows = gameState.nodes.map(
        (n) => `${n.name.padEnd(16)} ${n.status.padEnd(10)} worker   14d    v1.30.0`
      );
      outputText = [header, ...rows].join('\n');
    } else if (lower.startsWith('kubectl get svc') || lower.startsWith('kubectl get service') || lower === 'get svc') {
      const header = 'NAME          TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)';
      const rows = gameState.services.map(
        (s) => `${s.name.padEnd(13)} ${s.type.padEnd(11)} ${s.clusterIP.padEnd(12)} <none>        ${s.port}/TCP`
      );
      outputText = [header, ...rows].join('\n');
    } else if (lower.startsWith('kubectl get deploy') || lower === 'get deploy') {
      const header = 'NAME    READY   UP-TO-DATE   AVAILABLE   AGE';
      const dep = gameState.deployments[0];
      const readyPods = gameState.pods.filter((p) => p.status === 'Running').length;
      outputText = dep
        ? [header, `${dep.name.padEnd(7)} ${readyPods}/${dep.desiredReplicas}     ${dep.desiredReplicas}            ${readyPods}           14d`].join('\n')
        : 'No deployments found.';
    } else if (lower.startsWith('kubectl get hpa') || lower === 'get hpa') {
      const dep = gameState.deployments[0];
      if (dep?.hpaEnabled) {
        outputText = `NAME        REFERENCE         TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
web-hpa     Deployment/web    45%/60%   ${dep.hpaMinReplicas || 2}         ${dep.hpaMaxReplicas || 7}         ${dep.desiredReplicas}          5m`;
      } else {
        outputText = 'No HorizontalPodAutoscalers found in default namespace.';
      }
    } else if (lower.startsWith('kubectl describe pod') || lower.startsWith('describe pod')) {
      const parts = trimmed.split(' ');
      const podName = parts[parts.length - 1];
      const pod = gameState.pods.find((p) => p.name.includes(podName) || p.id.includes(podName)) || gameState.pods[0];
      if (pod) {
        outputText = `Name:         ${pod.name}
Namespace:    default
Node:         ${pod.nodeId}/192.168.1.10
Status:       ${pod.status}
IP:           10.244.0.42
Containers:
  ${pod.deploymentName}:
    Image:          ${gameState.deployments[0]?.image || 'web:1.0'}
    Port:           80/TCP
    State:          ${pod.status === 'Running' ? 'Running' : pod.status === 'CrashLoopBackOff' ? 'Waiting (CrashLoopBackOff)' : 'Terminated (Exit Code 137)'}
    Limits:
      cpu:          ${pod.cpuLimit}m
      memory:       ${pod.memoryLimit}Mi
    Requests:
      cpu:          ${pod.cpuRequest}m
      memory:       ${pod.memoryRequest}Mi
Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Normal   Scheduled  2m    default-scheduler  Successfully assigned default/${pod.name} to ${pod.nodeId}
  Normal   Pulled     2m    kubelet            Container image pulled successfully
  ${pod.status === 'OOMKilled' ? 'Warning  OOMKilled  10s   kubelet            Container exceeded memory limit (137)' : 'Normal   Started    1m    kubelet            Started container'}`;
      } else {
        outputText = `Error from server (NotFound): pods "${podName}" not found`;
        outputType = 'error';
      }
    } else if (lower.startsWith('kubectl describe node') || lower.startsWith('describe node')) {
      const parts = trimmed.split(' ');
      const nodeName = parts[parts.length - 1];
      const node = gameState.nodes.find((n) => n.name.includes(nodeName) || n.id.includes(nodeName)) || gameState.nodes[0];
      if (node) {
        outputText = `Name:               ${node.name}
Roles:              worker
Status:             ${node.status}
Capacity:
  cpu:              ${node.cpuCapacity}m
  memory:           ${node.memoryCapacity}Mi
Allocated:
  cpu:              ${Math.round(node.cpuAllocated)}m
  memory:           ${Math.round(node.memoryAllocated)}Mi
Conditions:
  Type             Status
  ----             ------
  Ready            ${node.status === 'Ready' ? 'True' : 'False'}
  MemoryPressure   ${node.memoryAllocated > node.memoryCapacity * 0.9 ? 'True' : 'False'}`;
      } else {
        outputText = `Error from server (NotFound): nodes "${nodeName}" not found`;
        outputType = 'error';
      }
    } else if (lower.startsWith('kubectl describe svc') || lower.startsWith('describe svc')) {
      const svc = gameState.services[0];
      outputText = `Name:              ${svc?.name || 'web-service'}
Namespace:         default
Type:              ${svc?.type || 'ClusterIP'}
IP:                ${svc?.clusterIP || '10.96.0.12'}
Port:              http  80/TCP
TargetPort:        80/TCP
Selector:          app=${svc?.selector['app'] || 'none'}
Endpoints:         ${gameState.pods.filter(p => p.status === 'Running').map(p => `10.244.0.${p.id.slice(-2)}:80`).join(', ') || '<none>'}`;
    } else if (lower.includes('apply -f service.yaml') || lower.includes('service.yaml')) {
      handleFixServiceSelector();
      return;
    } else if (lower.includes('set env') || lower.includes('db_host')) {
      handleFixEnv();
      return;
    } else if (lower.includes('rollout status')) {
      const isV2 = gameState.deployments[0]?.version === 'v2.0';
      outputText = isV2
        ? 'deployment "web" successfully rolled out to v2.0'
        : 'Waiting for deployment "web" rollout to finish: 0 of 3 updated replicas are available...';
      outputType = isV2 ? 'success' : 'output';
    } else if (lower.includes('scale')) {
      const match = lower.match(/--replicas=(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        handleScale(num - (gameState.deployments[0]?.desiredReplicas || 0));
        return;
      } else {
        outputText = 'Usage: kubectl scale deployment web --replicas=<count>';
        outputType = 'error';
      }
    } else if (lower.includes('logs')) {
      const parts = trimmed.split(' ');
      const podName = parts[parts.length - 1];
      const pod =
        gameState.pods.find((p) => p.name.includes(podName) || p.id.includes(podName)) ||
        gameState.pods[0];
      if (pod) {
        outputText = pod.logs.join('\n');
      } else {
        outputText = `Error from server (NotFound): pods "${podName}" not found`;
        outputType = 'error';
      }
    } else if (lower.includes('limits=memory=')) {
      handleIncreaseLimits();
      return;
    } else if (lower.includes('web-app:2.0')) {
      handleRolloutV2();
      return;
    } else if (lower.includes('autoscale')) {
      handleToggleHPA();
      return;
    } else {
      outputText = `Command not recognized. Type \`kubectl help\` for available commands.`;
      outputType = 'error';
    }

    setGameState((prev) => ({
      ...prev,
      terminalHistory: [
        ...prev.terminalHistory,
        { text: `$ ${trimmed}`, type: 'cmd' },
        { text: outputText, type: outputType }
      ]
    }));
  };

  const currentLevel = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  const handleSendTestPacket = () => {
    soundEngine.playClick();
    setGameState((prev) => k8sEngine.spawnSinglePacket(prev));
  };

  const handleToggleAutoTraffic = () => {
    soundEngine.playClick();
    setGameState((prev) => ({
      ...prev,
      isAutoTraffic: prev.isAutoTraffic === false ? true : false
    }));
  };

  const computeHighlightAction = (): 'scale' | 'rollout' | 'env' | 'limits' | 'service' | 'hpa' | 'node' | 'none' => {
    const tutorial = MISSION_TUTORIALS[currentLevelId];
    if (tutorial) {
      const activeStep = tutorial.steps.find((s) => !s.isComplete(gameState));
      if (activeStep && activeStep.highlightTarget !== 'none' && activeStep.highlightTarget !== 'test-request') {
        return activeStep.highlightTarget as 'scale' | 'rollout' | 'env' | 'limits' | 'service' | 'hpa' | 'node' | 'none';
      }
    }
    return 'none';
  };

  const highlightAction = computeHighlightAction();

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Navigation */}
      <Navbar
        currentLevelId={currentLevelId}
        mode={mode}
        isMuted={isMuted}
        score={gameState.score}
        sla={gameState.sla}
        onSelectLevel={(id) => loadLevel(id, 'campaign')}
        onToggleMode={(m) => loadLevel(1, m)}
        onToggleAudio={() => {
          const next = soundEngine.toggleMute();
          setIsMuted(next);
        }}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onResetLevel={() => loadLevel(currentLevelId, mode)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 p-3 overflow-hidden">
        {/* Left / Center: Interactive Cluster Canvas */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* Interactive KubeBot Mentor & Mission Guide */}
          {mode === 'campaign' && (
            <InteractiveMentor
              state={gameState}
              onActionClick={(action) => {
                if (action === 'scale') handleScale(1);
                if (action === 'env') handleFixEnv();
                if (action === 'limits') handleIncreaseLimits();
                if (action === 'service') handleFixServiceSelector();
                if (action === 'rollout') handleRolloutV2();
                if (action === 'hpa') handleToggleHPA();
                if (action === 'node') handleAddNode();
              }}
              onSendTestPacket={handleSendTestPacket}
              onToggleAutoTraffic={handleToggleAutoTraffic}
              isAutoTraffic={gameState.isAutoTraffic !== false}
              onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            />
          )}

          <div className="flex-1 min-h-[280px]">
            <ClusterCanvas
              state={gameState}
              onSelectPod={(podId) => {
                const found = gameState.pods.find((p) => p.id === podId) || null;
                setInspectedPod(found);
              }}
              onSelectNode={(nodeId) => {
                setGameState((prev) => ({ ...prev, selectedNodeId: nodeId }));
              }}
            />
          </div>

          {/* Quick Action Control Panel */}
          <ControlPanel
            state={gameState}
            highlightAction={highlightAction}
            onScale={handleScale}
            onRolloutV2={handleRolloutV2}
            onFixEnv={handleFixEnv}
            onIncreaseLimits={handleIncreaseLimits}
            onFixServiceSelector={handleFixServiceSelector}
            onToggleHPA={handleToggleHPA}
            onAddNode={handleAddNode}
            onTriggerChaos={handleTriggerChaos}
            onTogglePause={() =>
              setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
            }
            onToggleSpeed={() =>
              setGameState((prev) => ({
                ...prev,
                gameSpeed: prev.gameSpeed === 1 ? 2 : 1
              }))
            }
          />
        </div>

        {/* Right / Bottom: Kubectl CLI & Live YAML Inspector */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col gap-2 shrink-0 h-full min-h-0 overflow-hidden">
          {/* Tab buttons */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('terminal');
              }}
              className={`flex-1 py-1.5 font-bold rounded-lg transition ${
                activeTab === 'terminal'
                  ? 'bg-cyan-600 text-white shadow-sm glow-cyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              kubectl Terminal
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('yaml');
              }}
              className={`flex-1 py-1.5 font-bold rounded-lg transition ${
                activeTab === 'yaml'
                  ? 'bg-cyan-600 text-white shadow-sm glow-cyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live YAML Spec
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {activeTab === 'terminal' ? (
              <KubectlTerminal
                state={gameState}
                onExecuteCommand={handleExecuteCommand}
                onClearTerminal={() =>
                  setGameState((prev) => ({ ...prev, terminalHistory: [] }))
                }
              />
            ) : (
              <YamlViewer state={gameState} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LevelModal
        level={currentLevel}
        state={gameState}
        isOpen={isBriefingOpen || isVictoryOpen}
        isVictory={isVictoryOpen}
        onClose={() => setIsBriefingOpen(false)}
        onNextLevel={() => {
          if (currentLevelId < LEVELS.length) {
            loadLevel(currentLevelId + 1, 'campaign');
          } else {
            // Completed all levels! Switch to Survival mode
            loadLevel(1, 'survival');
          }
        }}
        onRestartLevel={() => loadLevel(currentLevelId, mode)}
      />

      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />

      <PodInspectorModal
        pod={inspectedPod}
        onClose={() => setInspectedPod(null)}
        onRestartPod={(podId) => {
          setGameState((prev) => ({
            ...prev,
            pods: prev.pods.map((p) =>
              p.id === podId
                ? {
                    ...p,
                    status: 'Pending',
                    ready: false,
                    restarts: p.restarts + 1,
                    createdTime: Date.now(),
                    logs: [...p.logs, 'Manual restart triggered via inspector']
                  }
                : p
            )
          }));
          setInspectedPod(null);
        }}
      />
    </div>
  );
};

export default App;
