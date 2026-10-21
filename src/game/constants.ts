import type { EnemyType, TowerType, WaveDefinition } from './types';

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GRID_COLS = 16;
export const GRID_ROWS = 9;
export const CELL_SIZE = 60;

// Waypoints forming the circuit board traffic path from Ingress Gateway to Database Core
export const PATH_WAYPOINTS: Array<{ x: number; y: number }> = [
  { x: 0, y: 150 },
  { x: 210, y: 150 },
  { x: 210, y: 390 },
  { x: 450, y: 390 },
  { x: 450, y: 150 },
  { x: 690, y: 150 },
  { x: 690, y: 390 },
  { x: 960, y: 390 }
];

export const TOWER_CONFIGS: Record<
  TowerType,
  {
    name: string;
    description: string;
    cost: number;
    range: number;
    damage: number;
    fireRate: number;
    color: string;
    k8sRole: string;
  }
> = {
  pod: {
    name: 'Pod Tower',
    description: 'Fires laser beams to process requests into HTTP 200 OK.',
    cost: 100,
    range: 130,
    damage: 25,
    fireRate: 1.5,
    color: '#06b6d4', // Cyan
    k8sRole: 'The basic computing unit running containers.'
  },
  service: {
    name: 'Service Tower',
    description: 'Emits a Round-Robin aura that slows enemies by 40% and balances load.',
    cost: 150,
    range: 160,
    damage: 5,
    fireRate: 3.0,
    color: '#3b82f6', // Blue
    k8sRole: 'Provides stable virtual IP & load balances traffic.'
  },
  ingress: {
    name: 'Ingress Gateway',
    description: 'Placed at entrance. Decrypts packets (SSL termination), weakening their armor.',
    cost: 180,
    range: 170,
    damage: 15,
    fireRate: 1.0,
    color: '#8b5cf6', // Purple
    k8sRole: 'Layer 7 HTTP entrypoint from the public web.'
  },
  hpa: {
    name: 'HPA Autoscaler',
    description: 'Aura satellite: increases attack speed of all nearby Pods by 50%!',
    cost: 250,
    range: 180,
    damage: 0,
    fireRate: 0,
    color: '#10b981', // Emerald
    k8sRole: 'Horizontally scales pod capacity automatically on demand.'
  }
};

export const ENEMY_CONFIGS: Record<
  EnemyType,
  {
    name: string;
    maxHp: number;
    speed: number;
    reward: number;
    color: string;
    size: number;
    memoryWeight: number;
    description: string;
  }
> = {
  'http-get': {
    name: 'HTTP GET Request',
    maxHp: 60,
    speed: 75,
    reward: 15,
    color: '#38bdf8', // Sky Blue
    size: 11,
    memoryWeight: 20,
    description: 'Standard webpage request. Regular speed and health.'
  },
  'api-post': {
    name: 'Heavy API POST',
    maxHp: 160,
    speed: 50,
    reward: 35,
    color: '#c084fc', // Purple
    size: 15,
    memoryWeight: 90,
    description: 'Large payload packet. Armored with high health.'
  },
  'ddos-swarm': {
    name: 'DDoS Bug Swarm',
    maxHp: 35,
    speed: 120,
    reward: 12,
    color: '#fb7185', // Rose
    size: 9,
    memoryWeight: 10,
    description: 'Very fast packet burst! Overwhelms undefended lanes.'
  },
  'traffic-boss': {
    name: 'Black Friday Boss Wave',
    maxHp: 1200,
    speed: 38,
    reward: 200,
    color: '#f59e0b', // Amber
    size: 26,
    memoryWeight: 250,
    description: 'Massive traffic wave! Tests your cluster scaling limits.'
  }
};

export const WAVES: WaveDefinition[] = [
  {
    waveNumber: 1,
    title: 'First Visitors (Hello Pod)',
    k8sLessonTitle: 'Deploy Your First Pod Tower',
    k8sLessonText:
      'In Kubernetes, applications run inside Pods. Place a Pod Tower near the track to process incoming HTTP requests!',
    k8sAnalogy:
      'A Pod is your server worker. Without at least 1 Pod, requests leak straight to the database and cause outages.',
    rewardBonus: 100,
    enemySpawns: [{ type: 'http-get', count: 8, delaySec: 1.4 }]
  },
  {
    waveNumber: 2,
    title: 'Traffic Rush (Scale Replicas)',
    k8sLessonTitle: 'Scale Replicas to Hit Multiple Targets',
    k8sLessonText:
      'Fast swarms are arriving! Single pods get overwhelmed. Click your Pod Tower and upgrade "Scale Replicas" to add a 2nd laser cannon!',
    k8sAnalogy:
      'Scaling replicas in Kubernetes means running multiple identical copies of a Pod to handle more traffic at once.',
    rewardBonus: 120,
    enemySpawns: [
      { type: 'http-get', count: 6, delaySec: 1.2 },
      { type: 'ddos-swarm', count: 8, delaySec: 0.7 }
    ]
  },
  {
    waveNumber: 3,
    title: 'Heavy Payloads (Tune Limits & RAM)',
    k8sLessonTitle: 'Upgrade Memory Limits to Avoid OOMKilled',
    k8sLessonText:
      'Heavy purple API POST packets are arriving! Click your Pod Tower and upgrade "Tune Limits" to increase RAM ceiling!',
    k8sAnalogy:
      'Linux cgroups kill containers that exceed memory limits (Exit Code 137). Giving your pods more RAM lets them process heavy payloads without crashing.',
    rewardBonus: 150,
    enemySpawns: [
      { type: 'api-post', count: 6, delaySec: 1.8 },
      { type: 'http-get', count: 8, delaySec: 1.0 }
    ]
  },
  {
    waveNumber: 4,
    title: 'Traffic Splitting (Service Tower)',
    k8sLessonTitle: 'Build a Service Load Balancer Tower',
    k8sLessonText:
      'Place a Service Tower in the middle! Its round-robin aura slows packets down by 40% and balances them so your Pods can zap them!',
    k8sAnalogy:
      'A Kubernetes Service acts as a reverse-proxy load balancer. It gives pods a stable virtual IP and prevents any single pod from choking.',
    rewardBonus: 180,
    enemySpawns: [
      { type: 'ddos-swarm', count: 12, delaySec: 0.6 },
      { type: 'api-post', count: 5, delaySec: 1.5 }
    ]
  },
  {
    waveNumber: 5,
    title: 'Gateway Security (Ingress Tower)',
    k8sLessonTitle: 'Deploy Ingress Gateway Tower',
    k8sLessonText:
      'Place an Ingress Tower near the entrance! It decrypts packets (SSL termination) and shreds enemy armor before they enter the cluster.',
    k8sAnalogy:
      'Ingress is the front door of Kubernetes. It terminates HTTPS traffic and routes paths (/api vs /web) into internal cluster services.',
    rewardBonus: 200,
    enemySpawns: [
      { type: 'api-post', count: 8, delaySec: 1.4 },
      { type: 'ddos-swarm', count: 10, delaySec: 0.5 },
      { type: 'http-get', count: 10, delaySec: 0.8 }
    ]
  },
  {
    waveNumber: 6,
    title: 'Version 2.0 (Zero-Downtime Rollout)',
    k8sLessonTitle: 'Upgrade Pods to Version v2.0',
    k8sLessonText:
      'Engineering shipped v2.0! Click your Pod Towers and upgrade "Rollout v2" for supercharged double-damage blue laser beams!',
    k8sAnalogy:
      'Kubernetes Rolling Updates upgrade your application version live while traffic is running with 0 downtime.',
    rewardBonus: 250,
    enemySpawns: [
      { type: 'api-post', count: 10, delaySec: 1.2 },
      { type: 'ddos-swarm', count: 16, delaySec: 0.4 }
    ]
  },
  {
    waveNumber: 7,
    title: 'Flash Mob Surge (HPA Autoscaler)',
    k8sLessonTitle: 'Place an HPA Autoscaler Tower',
    k8sLessonText:
      'Place an HPA Tower next to your Pods! When packet count surges, HPA triggers an overdrive aura, boosting nearby Pod attack speed by 50%!',
    k8sAnalogy:
      'The Horizontal Pod Autoscaler monitors metrics and dynamically spins up extra capacity when traffic spikes occur.',
    rewardBonus: 300,
    enemySpawns: [
      { type: 'ddos-swarm', count: 22, delaySec: 0.35 },
      { type: 'api-post', count: 8, delaySec: 1.0 }
    ]
  },
  {
    waveNumber: 8,
    title: 'Boss: Black Friday Traffic Wave',
    k8sLessonTitle: 'Survive the Chaos Monkey & Mega Wave',
    k8sLessonText:
      'The ultimate test! A giant 1200 HP Black Friday Mega Wave boss has arrived with minion escorts. Use all your scaled Pods and HPA to take it down!',
    k8sAnalogy:
      'In production, real DevOps mastery is surviving viral traffic spikes without dropping a single customer transaction.',
    rewardBonus: 500,
    enemySpawns: [
      { type: 'traffic-boss', count: 1, delaySec: 0.1 },
      { type: 'ddos-swarm', count: 14, delaySec: 0.5 },
      { type: 'api-post', count: 6, delaySec: 1.2 }
    ]
  }
];
