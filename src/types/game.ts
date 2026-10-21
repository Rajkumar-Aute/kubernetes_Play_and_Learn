export type PodStatus = 'Pending' | 'Running' | 'CrashLoopBackOff' | 'OOMKilled' | 'Terminating';

export interface Pod {
  id: string;
  name: string;
  deploymentName: string;
  nodeId: string;
  status: PodStatus;
  version: string;
  cpuRequest: number; // in millicores (e.g. 100m)
  cpuLimit: number;
  memoryRequest: number; // in MiB (e.g. 128Mi)
  memoryLimit: number;
  memoryUsage: number;
  cpuUsage: number;
  ready: boolean;
  restarts: number;
  createdTime: number;
  logs: string[];
  env: Record<string, string>;
  livenessProbePassed: boolean;
  readinessProbePassed: boolean;
}

export interface Node {
  id: string;
  name: string;
  status: 'Ready' | 'NotReady';
  cpuCapacity: number; // in millicores (e.g. 1000m)
  cpuAllocated: number;
  memoryCapacity: number; // in MiB (e.g. 1024Mi)
  memoryAllocated: number;
  isCrashed?: boolean;
}

export interface Deployment {
  name: string;
  image: string;
  version: string;
  desiredReplicas: number;
  availableReplicas: number;
  cpuRequest: number;
  cpuLimit: number;
  memoryRequest: number;
  memoryLimit: number;
  env: Record<string, string>;
  hasLivenessProbe: boolean;
  hasReadinessProbe: boolean;
  hpaEnabled: boolean;
  hpaMinReplicas?: number;
  hpaMaxReplicas?: number;
  hpaTargetCpu?: number;
}

export interface Service {
  name: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  port: number;
  targetPort: number;
  selector: Record<string, string>;
  clusterIP: string;
}

export interface IngressRule {
  path: string;
  serviceName: string;
  servicePort: number;
}

export interface Ingress {
  name: string;
  rules: IngressRule[];
  enabled: boolean;
}

export interface TrafficPacket {
  id: string;
  path: string;
  sourceX: number;
  sourceY: number;
  targetPodId?: string;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
  status: 'in-flight' | 'success' | 'failed';
  failureReason?: string;
  memoryWeight: number; // memory impact
}

export interface LevelObjective {
  id: string;
  title: string;
  description: string;
  isCompleted: (state: GameState) => boolean;
}

export interface Level {
  id: number;
  name: string;
  subtitle: string;
  k8sConcept: string;
  briefing: string;
  explanation: string;
  initialYaml: string;
  hints: string[];
  objectives: LevelObjective[];
  initialState: Partial<GameState>;
  targetTrafficRate: number; // req/sec
  durationSeconds?: number;
}

export type GameMode = 'campaign' | 'survival';

export interface GameState {
  mode: GameMode;
  currentLevelId: number;
  isPaused: boolean;
  gameSpeed: number; // 1x, 2x
  score: number;
  highScore: number;
  uptimeSeconds: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  sla: number; // percentage (0 - 100%)
  
  // K8s Cluster Objects
  nodes: Node[];
  deployments: Deployment[];
  pods: Pod[];
  services: Service[];
  ingress: Ingress;
  
  // Traffic simulation
  packets: TrafficPacket[];
  trafficRate: number; // req per second
  trafficSpikeActive: boolean;
  
  // Chaos events
  chaosActive: boolean;
  activeChaosEvent?: string;
  
  // Terminal logs & history
  terminalHistory: Array<{ text: string; type: 'cmd' | 'output' | 'error' | 'success' }>;
  
  // Inspection
  selectedPodId?: string;
  selectedNodeId?: string;
}
