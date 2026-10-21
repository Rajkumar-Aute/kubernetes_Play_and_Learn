export type TowerType = 'pod' | 'service' | 'ingress' | 'hpa';

export type EnemyType = 'http-get' | 'api-post' | 'ddos-swarm' | 'traffic-boss';

export interface GridTile {
  col: number;
  row: number;
  isPath: boolean;
  towerId?: string;
  isUnlocked: boolean; // can buy node expansion
}

export interface Tower {
  id: string;
  type: TowerType;
  name: string;
  col: number;
  row: number;
  x: number; // canvas pixels
  y: number;
  level: number;
  replicas: number; // For pod: 1 to 4 laser cannons
  memoryLimit: number; // in MiB (64, 128, 256, 512)
  version: 'v1.0' | 'v2.0';
  range: number; // attack radius in pixels
  damage: number;
  fireRate: number; // attacks per second
  lastShotTime: number;
  targetEnemyId?: string;
  cost: number;
  totalInvested: number;
  hpaBoosted?: boolean;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  distanceTraveled: number;
  pathIndex: number;
  hp: number;
  maxHp: number;
  speed: number; // pixels per sec
  speedModifier: number; // slow multiplier, e.g. 0.6 from Service
  slowDuration: number;
  isDecrypted?: boolean; // Ingress stripped armor
  reward: number; // Cloud Coins
  memoryWeight: number; // payload size (tests pod memory)
  color: string;
  size: number;
  isBoss?: boolean;
}

export interface Projectile {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  targetEnemyId: string;
  damage: number;
  color: string;
  progress: number;
  isLaserBeam?: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 to 1
  color: string;
  size: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface WaveDefinition {
  waveNumber: number;
  title: string;
  k8sLessonTitle: string;
  k8sLessonText: string;
  k8sAnalogy: string;
  enemySpawns: Array<{ type: EnemyType; count: number; delaySec: number }>;
  rewardBonus: number;
}
