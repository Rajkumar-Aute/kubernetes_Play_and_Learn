import type { GameState, Pod, TrafficPacket } from '../types/game';
import { soundEngine } from './soundEngine';

export class KubernetesSimulationEngine {
  private lastHpaCheck: number = 0;
  private serviceIndex: number = 0;

  public tick(state: GameState, deltaSec: number): GameState {
    if (state.isPaused) return state;

    const updatedState: GameState = {
      ...state,
      uptimeSeconds: state.uptimeSeconds + deltaSec
    };

    // 1. Update Pod states (CPU/Memory decay, startup transitions, kubelet auto-restarts)
    updatedState.pods = this.updatePods(updatedState.pods, updatedState.deployments, deltaSec);

    // 2. Self-Healing & Pod Scheduling: Ensure desiredReplicas matches actual pods
    updatedState.pods = this.reconcileReplicas(updatedState);

    // 3. Autonomous HPA scaling if enabled
    if (Date.now() - this.lastHpaCheck > 3000) {
      this.lastHpaCheck = Date.now();
      this.evaluateHPA(updatedState);
    }

    // 4. Update Node allocation metrics
    this.updateNodeMetrics(updatedState);

    // 5. Generate & advance traffic packets
    this.simulateTraffic(updatedState, deltaSec);

    // 6. Calculate real-time SLA and score
    const total = updatedState.successfulRequests + updatedState.failedRequests;
    if (total > 0) {
      updatedState.sla = Math.round((updatedState.successfulRequests / total) * 1000) / 10;
    } else {
      updatedState.sla = 100;
    }

    // In survival mode, score accumulates based on SLA and uptime
    if (updatedState.mode === 'survival') {
      const slaMultiplier = updatedState.sla >= 99 ? 3 : updatedState.sla >= 95 ? 2 : 1;
      updatedState.score += Math.round(updatedState.successfulRequests * 2 * slaMultiplier * deltaSec);
      if (updatedState.score > updatedState.highScore) {
        updatedState.highScore = updatedState.score;
      }
    } else {
      updatedState.score = updatedState.successfulRequests * 10;
    }

    return updatedState;
  }

  private updatePods(pods: Pod[], deployments: GameState['deployments'], deltaSec: number): Pod[] {
    return pods.map((pod) => {
      const dep = deployments.find((d) => d.name === pod.deploymentName);
      if (!dep) return pod;

      const updatedPod = { ...pod };

      // Transition Pending pods to Running after 1.5s
      if (updatedPod.status === 'Pending') {
        if (Date.now() - updatedPod.createdTime > 1500) {
          // Check if environment is missing (Mission 4 condition)
          if (updatedPod.deploymentName === 'backend' && !updatedPod.env['DB_HOST']) {
            updatedPod.status = 'CrashLoopBackOff';
            updatedPod.ready = false;
            updatedPod.restarts += 1;
            soundEngine.playAlert();
          } else {
            updatedPod.status = 'Running';
            updatedPod.ready = true;
            updatedPod.memoryUsage = Math.min(updatedPod.memoryUsage, 50); // reset baseline on start
            soundEngine.playDeploy();
          }
        }
      }

      // Check OOM condition
      if (updatedPod.status === 'Running' && updatedPod.memoryUsage > updatedPod.memoryLimit) {
        updatedPod.status = 'OOMKilled';
        updatedPod.ready = false;
        updatedPod.createdTime = Date.now(); // mark time when OOM occurred for backoff
        updatedPod.restarts += 1;
        updatedPod.logs.push(`Kernel: OOMKilled - Exceeded memory limit ${updatedPod.memoryLimit}MiB (Exit Code 137)`);
        soundEngine.playAlert();
      }

      // Kubelet Auto-Restart Loop for OOMKilled pods (restarts after 3.5s backoff)
      if (updatedPod.status === 'OOMKilled') {
        if (Date.now() - updatedPod.createdTime > 3500) {
          updatedPod.status = 'Pending';
          updatedPod.createdTime = Date.now();
          updatedPod.memoryUsage = 45; // Reset memory footprint on container restart
          updatedPod.logs.push(`[Kubelet] Restarting container after OOM kill (restart count: ${updatedPod.restarts})...`);
        }
      }

      // Gradually decay CPU and memory back toward idle baseline
      if (updatedPod.status === 'Running') {
        updatedPod.cpuUsage = Math.max(10, updatedPod.cpuUsage - 35 * deltaSec);
        // Only decay memory if not currently overloaded
        updatedPod.memoryUsage = Math.max(45, updatedPod.memoryUsage - 25 * deltaSec);
      }

      return updatedPod;
    });
  }

  private reconcileReplicas(state: GameState): Pod[] {
    const readyNodes = state.nodes.filter((n) => n.status === 'Ready');
    let currentPods = [...state.pods];

    // Check for pods running on crashed/NotReady nodes
    const deadNodeIds = state.nodes.filter((n) => n.status !== 'Ready').map((n) => n.id);
    const affectedPods = currentPods.filter((p) => deadNodeIds.includes(p.nodeId));
    if (affectedPods.length > 0 && readyNodes.length > 0) {
      // Evict and reschedule to healthy nodes
      currentPods = currentPods.map((p) => {
        if (deadNodeIds.includes(p.nodeId)) {
          // pick least loaded healthy node
          const targetNode = readyNodes[Math.floor(Math.random() * readyNodes.length)];
          return {
            ...p,
            nodeId: targetNode.id,
            status: 'Pending',
            createdTime: Date.now(),
            logs: [...p.logs, `Evicted from dead node, rescheduling on ${targetNode.name}...`]
          };
        }
        return p;
      });
    }

    state.deployments.forEach((dep) => {
      const activePods = currentPods.filter(
        (p) => p.deploymentName === dep.name && p.status !== 'Terminating'
      );

      // Need to scale UP
      if (activePods.length < dep.desiredReplicas && readyNodes.length > 0) {
        const podsToCreate = dep.desiredReplicas - activePods.length;
        for (let i = 0; i < podsToCreate; i++) {
          // Balance across nodes: count pods currently on each node
          const nodePodCounts = readyNodes.map((n) => ({
            node: n,
            count: currentPods.filter((p) => p.nodeId === n.id).length
          }));
          nodePodCounts.sort((a, b) => a.count - b.count);
          const chosenNode = nodePodCounts[0].node;

          const newPod: Pod = {
            id: `pod-${dep.name}-${Math.random().toString(36).substring(2, 7)}`,
            name: `${dep.name}-${Math.random().toString(36).substring(2, 6)}`,
            deploymentName: dep.name,
            nodeId: chosenNode.id,
            status: 'Pending',
            version: dep.version,
            cpuRequest: dep.cpuRequest,
            cpuLimit: dep.cpuLimit,
            memoryRequest: dep.memoryRequest,
            memoryLimit: dep.memoryLimit,
            memoryUsage: 50,
            cpuUsage: 15,
            ready: false,
            restarts: 0,
            createdTime: Date.now(),
            logs: [`Pod instantiated on ${chosenNode.name}`, `Pulling image ${dep.image}...`],
            env: { ...dep.env },
            livenessProbePassed: dep.hasLivenessProbe,
            readinessProbePassed: dep.hasReadinessProbe
          };
          currentPods.push(newPod);
        }
      }
      // Need to scale DOWN
      else if (activePods.length > dep.desiredReplicas) {
        const podsToRemove = activePods.length - dep.desiredReplicas;
        let removed = 0;
        currentPods = currentPods.filter((p) => {
          if (p.deploymentName === dep.name && removed < podsToRemove) {
            removed++;
            return false;
          }
          return true;
        });
      }
    });

    return currentPods;
  }

  private evaluateHPA(state: GameState) {
    state.deployments.forEach((dep) => {
      if (!dep.hpaEnabled) return;
      const runningPods = state.pods.filter((p) => p.deploymentName === dep.name && p.status === 'Running');
      if (runningPods.length === 0) return;

      const avgCpu = runningPods.reduce((sum, p) => sum + p.cpuUsage, 0) / runningPods.length;
      const targetCpu = dep.hpaTargetCpu || 60;
      const min = dep.hpaMinReplicas || 1;
      const max = dep.hpaMaxReplicas || 6;

      if (avgCpu > targetCpu && dep.desiredReplicas < max) {
        dep.desiredReplicas = Math.min(max, dep.desiredReplicas + 1);
      } else if (avgCpu < targetCpu - 25 && dep.desiredReplicas > min) {
        dep.desiredReplicas = Math.max(min, dep.desiredReplicas - 1);
      }
    });
  }

  private updateNodeMetrics(state: GameState) {
    state.nodes.forEach((node) => {
      const nodePods = state.pods.filter((p) => p.nodeId === node.id && p.status !== 'Terminating');
      node.cpuAllocated = nodePods.reduce((sum, p) => sum + (p.status === 'Running' ? p.cpuUsage * 2 : p.cpuRequest), 0);
      node.memoryAllocated = nodePods.reduce((sum, p) => sum + (p.status === 'Running' ? p.memoryUsage : p.memoryRequest), 0);
    });
  }

  public spawnSinglePacket(state: GameState): GameState {
    const readyPods = state.pods.filter((p) => p.status === 'Running' && p.ready);
    const service = state.services[0];
    const selectorKey = service ? Object.keys(service.selector)[0] : null;
    const selectorVal = selectorKey ? service.selector[selectorKey] : null;

    const matchingPods = readyPods.filter((p) => {
      if (!selectorKey || !selectorVal) return false;
      return p.deploymentName === selectorVal;
    });

    let targetPod: Pod | undefined = undefined;
    if (matchingPods.length > 0) {
      this.serviceIndex = (this.serviceIndex + 1) % matchingPods.length;
      targetPod = matchingPods[this.serviceIndex];
    }

    const targetX = targetPod ? 680 : 160;
    const targetY = targetPod ? 120 + Math.random() * 240 : 250;

    const singlePacket: TrafficPacket = {
      id: `pkt-test-${Date.now()}`,
      path: '/',
      sourceX: 60,
      sourceY: 100,
      targetPodId: targetPod?.id,
      targetX,
      targetY,
      progress: 0,
      status: 'in-flight',
      memoryWeight: state.currentLevelId === 5 ? 80 : 2
    };

    return {
      ...state,
      totalRequests: state.totalRequests + 1,
      packets: [...state.packets, singlePacket],
      terminalHistory: [
        ...state.terminalHistory,
        {
          text: targetPod
            ? `$ curl -i http://cluster.local/ -> routed via svc/${service?.name} to pod/${targetPod.name} (200 OK)`
            : `$ curl -i http://cluster.local/ -> 503 Service Unavailable (No matching pod endpoints)`,
          type: targetPod ? 'success' : 'error'
        }
      ]
    };
  }

  private simulateTraffic(state: GameState, deltaSec: number) {
    // Only auto-spawn packets if isAutoTraffic !== false
    const canAutoSpawn = state.isAutoTraffic !== false;
    const spawnChance = canAutoSpawn ? state.trafficRate * deltaSec : 0;
    const packetsToSpawn = Math.floor(spawnChance) + (Math.random() < spawnChance % 1 ? 1 : 0);

    const readyPods = state.pods.filter((p) => p.status === 'Running' && p.ready);
    const service = state.services[0];

    // Determine target pod selector
    const selectorKey = service ? Object.keys(service.selector)[0] : null;
    const selectorVal = selectorKey ? service.selector[selectorKey] : null;

    const matchingPods = readyPods.filter((p) => {
      if (!selectorKey || !selectorVal) return false;
      return p.deploymentName === selectorVal;
    });

    const isMemoryLeakChallenge = state.currentLevelId === 5 || state.activeChaosEvent?.includes('Memory');

    for (let i = 0; i < packetsToSpawn; i++) {
      let targetPod: Pod | undefined = undefined;

      if (matchingPods.length > 0) {
        // Round-robin selection across matching pods
        this.serviceIndex = (this.serviceIndex + 1) % matchingPods.length;
        targetPod = matchingPods[this.serviceIndex];
      }

      state.totalRequests += 1;

      // Calculate source and target coordinates:
      // Ingress is at (50, 100), Service is at (140, 240)
      const targetX = targetPod ? 680 : 160;
      const targetY = targetPod ? 120 + Math.random() * 240 : 250;

      const newPacket: TrafficPacket = {
        id: `pkt-${Math.random().toString(36).substring(2, 8)}`,
        path: '/',
        sourceX: 60,
        sourceY: 100 + (Math.random() * 40 - 20),
        targetPodId: targetPod?.id,
        targetX,
        targetY,
        progress: 0,
        status: 'in-flight',
        // In Mission 5 (or chaos), memory weight is heavy to trigger the OOM challenge!
        // In other missions, memory weight is very low so pods don't accidentally crash.
        memoryWeight: isMemoryLeakChallenge ? 80 : 2
      };

      state.packets.push(newPacket);
    }

    // Move packets and resolve completion
    const updatedPackets: TrafficPacket[] = [];

    state.packets.forEach((pkt) => {
      pkt.progress += deltaSec * 2.0;

      if (pkt.progress >= 1) {
        if (pkt.targetPodId) {
          const pod = state.pods.find((p) => p.id === pkt.targetPodId);
          if (pod && pod.status === 'Running') {
            // Apply packet workload
            pod.cpuUsage = Math.min(100, pod.cpuUsage + 8);
            
            // Only add memory if it's the memory challenge or a slight bump
            if (isMemoryLeakChallenge) {
              pod.memoryUsage = Math.min(pod.memoryLimit + 30, pod.memoryUsage + pkt.memoryWeight * 0.4);
            } else {
              // Normal fluctuation: stay comfortably within 50 - 90 MiB
              pod.memoryUsage = Math.min(pod.memoryLimit * 0.6, pod.memoryUsage + 0.3);
            }

            // Check if packet caused OOM (only if limit exceeded)
            if (pod.memoryUsage > pod.memoryLimit) {
              pkt.status = 'failed';
              pkt.failureReason = '500 Pod OOMKilled';
              state.failedRequests += 1;
              soundEngine.playPacketError();
            } else {
              pkt.status = 'success';
              state.successfulRequests += 1;
              soundEngine.playPacketSuccess();
            }
          } else {
            pkt.status = 'failed';
            pkt.failureReason = '503 Service Unavailable (Pod not ready)';
            state.failedRequests += 1;
            soundEngine.playPacketError();
          }
        } else {
          // No pod to receive it (e.g., all pods dead or wrong selector)
          pkt.status = 'failed';
          pkt.failureReason = '503 No Endpoints Available';
          state.failedRequests += 1;
          soundEngine.playPacketError();
        }
      } else {
        updatedPackets.push(pkt);
      }
    });

    state.packets = updatedPackets;
  }
}

export const k8sEngine = new KubernetesSimulationEngine();
