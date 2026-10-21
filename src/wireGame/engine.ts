import { WIRE_LEVELS } from './levels';
import { wireSound } from './sound';
import { ytPlayables } from '../services/ytPlayables';
import type {
  WireConnection,
  WireLevel,
  WireNode,
  WirePacket
} from './types';

export interface WireGameState {
  currentLevelId: number;
  status: 'playing' | 'level_cleared' | 'game_over' | 'victory';
  deliveredCount: number;
  targetDeliveries: number;
  droppedCount: number;
  maxDroppedAllowed: number;
  nodes: WireNode[];
  wires: WireConnection[];
  packets: WirePacket[];
  dragWire: { fromNodeId: string; mouseX: number; mouseY: number } | null;
  selectedWireId: string | null;
  speed: number;
  score: number;
  roundRobinPointers: Record<string, number>;
}

export class WireEngine {
  public state: WireGameState;
  private spawnTimers: Record<string, number> = {};

  constructor() {
    this.state = this.getInitialState(1);
  }

  public getInitialState(levelId: number): WireGameState {
    const levelDef = WIRE_LEVELS.find((l) => l.id === levelId) || WIRE_LEVELS[0];

    // Deep clone nodes to keep queues fresh
    const nodes: WireNode[] = levelDef.nodes.map((n) => ({
      ...n,
      queue: [],
      lastProcessTime: performance.now() / 1000
    }));

    return {
      currentLevelId: levelDef.id,
      status: 'playing',
      deliveredCount: 0,
      targetDeliveries: levelDef.targetDeliveries,
      droppedCount: 0,
      maxDroppedAllowed: 5,
      nodes,
      wires: [],
      packets: [],
      dragWire: null,
      selectedWireId: null,
      speed: 1,
      score: 0,
      roundRobinPointers: {}
    };
  }

  public loadLevel(levelId: number) {
    this.state = this.getInitialState(levelId);
    this.spawnTimers = {};
  }

  public restartCurrentLevel() {
    this.loadLevel(this.state.currentLevelId);
  }

  public nextLevel() {
    const nextId = this.state.currentLevelId + 1;
    if (nextId <= WIRE_LEVELS.length) {
      this.loadLevel(nextId);
    } else {
      this.state.status = 'victory';
    }
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
  }

  // --- Wire Drag & Connect Operations ---

  public startDragWire(nodeId: string, mouseX: number, mouseY: number) {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    this.state.dragWire = { fromNodeId: nodeId, mouseX, mouseY };
  }

  public updateDragWire(mouseX: number, mouseY: number) {
    if (this.state.dragWire) {
      this.state.dragWire.mouseX = mouseX;
      this.state.dragWire.mouseY = mouseY;
    }
  }

  public endDragWire(targetNodeId: string | null): boolean {
    if (!this.state.dragWire) return false;

    const fromId = this.state.dragWire.fromNodeId;
    this.state.dragWire = null;

    if (!targetNodeId || fromId === targetNodeId) return false;

    // Check if wire already exists in either direction
    const exists = this.state.wires.some(
      (w) =>
        (w.fromNodeId === fromId && w.toNodeId === targetNodeId) ||
        (w.fromNodeId === targetNodeId && w.toNodeId === fromId)
    );
    if (exists) return false;

    // Check level max wires
    const levelDef = this.getCurrentLevel();
    if (this.state.wires.length >= levelDef.maxWires) {
      wireSound.playQueueOverflow();
      return false;
    }

    const fromNode = this.state.nodes.find((n) => n.id === fromId);
    const toNode = this.state.nodes.find((n) => n.id === targetNodeId);
    if (!fromNode || !toNode) return false;

    // Create wire connection
    const newWire: WireConnection = {
      id: `wire-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromNodeId: fromId,
      toNodeId: targetNodeId,
      color: fromNode.color
    };

    this.state.wires.push(newWire);
    wireSound.playWireSnap();
    return true;
  }

  public removeWire(wireId: string) {
    const index = this.state.wires.findIndex((w) => w.id === wireId);
    if (index !== -1) {
      this.state.wires.splice(index, 1);
      // Clean up packets on this wire
      this.state.packets = this.state.packets.filter((p) => p.wireId !== wireId);
      if (this.state.selectedWireId === wireId) {
        this.state.selectedWireId = null;
      }
      wireSound.playWireCut();
    }
  }

  public getCurrentLevel(): WireLevel {
    return (
      WIRE_LEVELS.find((l) => l.id === this.state.currentLevelId) || WIRE_LEVELS[0]
    );
  }

  // --- Main Simulation Loop ---

  public update(rawDt: number) {
    if (this.state.status !== 'playing') return;

    const dt = Math.min(rawDt * this.state.speed, 0.08);
    const levelDef = this.getCurrentLevel();

    // 1. Spawning Packets at Ingress Nodes
    for (const spawn of levelDef.spawns) {
      const timerKey = `${spawn.sourceNodeId}-${spawn.type}`;
      this.spawnTimers[timerKey] = (this.spawnTimers[timerKey] || 0) + dt;

      const interval = 1.0 / spawn.ratePerSec;
      if (this.spawnTimers[timerKey] >= interval) {
        this.spawnTimers[timerKey] = 0;
        const sourceNode = this.state.nodes.find((n) => n.id === spawn.sourceNodeId);
        if (sourceNode && sourceNode.queue.length < sourceNode.maxQueue) {
          sourceNode.queue.push(spawn.type);
        }
      }
    }

    // 2. Dispatching Packets from Node Queues onto Outgoing Wires
    for (const node of this.state.nodes) {
      if (node.queue.length === 0) continue;

      // Find all wires originating from this node
      const outgoingWires = this.state.wires.filter((w) => w.fromNodeId === node.id);
      if (outgoingWires.length === 0) continue;

      const now = performance.now() / 1000;
      const cooldown = 1.0 / node.processingSpeed;

      if (now - node.lastProcessTime >= cooldown) {
        const packetType = node.queue[0];

        // Canary Splitter Logic (80% / 20%)
        let chosenWire: WireConnection;
        if (node.type === 'canary' && outgoingWires.length >= 2) {
          const isCanary = Math.random() < 0.2;
          chosenWire = isCanary ? outgoingWires[1] : outgoingWires[0];
        } else {
          // Standard Round-Robin Dispatch across outgoing wires
          const currentPointer = this.state.roundRobinPointers[node.id] || 0;
          chosenWire = outgoingWires[currentPointer % outgoingWires.length];
          this.state.roundRobinPointers[node.id] = (currentPointer + 1) % outgoingWires.length;
        }

        // Dequeue packet and place on wire
        node.queue.shift();
        node.lastProcessTime = now;

        const packetColor =
          packetType === 'web'
            ? '#38bdf8'
            : packetType === 'api'
            ? '#c084fc'
            : packetType === 'auth'
            ? '#fbbf24'
            : '#ef4444';

        this.state.packets.push({
          id: `pkt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: packetType,
          wireId: chosenWire.id,
          fromNodeId: chosenWire.fromNodeId,
          toNodeId: chosenWire.toNodeId,
          progress: 0,
          speed: 0.7, // travels in ~1.4 seconds across wire
          color: packetColor
        });
      }
    }

    // 3. Advancing Packets along Wires & Handling Node Arrival
    for (let i = this.state.packets.length - 1; i >= 0; i--) {
      const pkt = this.state.packets[i];
      pkt.progress += dt * pkt.speed;

      if (pkt.progress >= 1.0) {
        // Packet reached destination node!
        this.handlePacketArrival(pkt);
        this.state.packets.splice(i, 1);
      }
    }

    // 4. Check Level Clear / Fail Conditions
    if (this.state.deliveredCount >= this.state.targetDeliveries) {
      this.state.status = 'level_cleared';
      wireSound.playLevelWin();
      ytPlayables.sendScore({ value: this.state.score });
    } else if (this.state.droppedCount >= this.state.maxDroppedAllowed) {
      this.state.status = 'game_over';
      wireSound.playQueueOverflow();
    }
  }

  private handlePacketArrival(pkt: WirePacket) {
    const targetNode = this.state.nodes.find((n) => n.id === pkt.toNodeId);
    if (!targetNode) return;

    wireSound.playNodePulse();

    // Special Case: NetworkPolicy Filter
    if (targetNode.type === 'netpolicy') {
      if (pkt.type === 'malicious') {
        // Successfully blocked and neutralized exploit!
        this.state.score += 50;
        return;
      }
    }

    // Terminal Node (Target Pod or Database)
    if (targetNode.type === 'pod' || targetNode.type === 'database') {
      const accepts =
        targetNode.acceptedPacketTypes.length === 0 ||
        targetNode.acceptedPacketTypes.includes(pkt.type);

      if (accepts) {
        // Success!
        this.state.deliveredCount++;
        this.state.score += 100;
        wireSound.playDeliverySuccess();
      } else {
        // Misrouted packet (e.g. sent /web to pod-api or rogue packet breached DB)
        this.state.droppedCount++;
        wireSound.playQueueOverflow();
      }
      return;
    }

    // Intermediate Node (Service, Ingress, Canary)
    if (targetNode.queue.length < targetNode.maxQueue) {
      targetNode.queue.push(pkt.type);
    } else {
      // Congestion buffer overflow!
      this.state.droppedCount++;
      wireSound.playQueueOverflow();
    }
  }
}
