export type WireNodeType =
  | 'ingress'
  | 'service'
  | 'pod'
  | 'secret'
  | 'database'
  | 'netpolicy'
  | 'canary';

export type PacketType = 'web' | 'api' | 'auth' | 'malicious';

export interface WirePort {
  id: string;
  type: 'in' | 'out';
  x: number; // absolute canvas pixels
  y: number;
}

export interface WireNode {
  id: string;
  type: WireNodeType;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  radius: number;
  labelKey?: string;
  labelValue?: string;
  acceptedPacketTypes: PacketType[];
  queue: PacketType[];
  maxQueue: number;
  processingSpeed: number; // packets processed per second
  lastProcessTime: number;
  color: string;
  icon: string;
}

export interface WireConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  color: string;
}

export interface WirePacket {
  id: string;
  type: PacketType;
  wireId: string;
  fromNodeId: string;
  toNodeId: string;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

export interface WireLevel {
  id: number;
  title: string;
  subtitle: string;
  objective: string;
  targetDeliveries: number;
  maxWires: number;
  nodes: WireNode[];
  initialWires?: Array<{ from: string; to: string }>;
  spawns: Array<{
    type: PacketType;
    sourceNodeId: string;
    ratePerSec: number;
    delaySec?: number;
  }>;
  k8sConceptTitle: string;
  k8sConceptExplanation: string;
  k8sAnalogy: string;
  k8sYamlSnippet: string;
}
