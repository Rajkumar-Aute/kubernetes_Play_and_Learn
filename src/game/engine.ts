import type {
  Enemy,
  EnemyType,
  FloatingText,
  GridTile,
  Particle,
  Projectile,
  Tower,
  TowerType
} from './types';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_SIZE,
  ENEMY_CONFIGS,
  GRID_COLS,
  GRID_ROWS,
  PATH_WAYPOINTS,
  TOWER_CONFIGS,
  WAVES
} from './constants';
import { kubeSound } from './sound';
import { ytPlayables } from '../services/ytPlayables';

export interface GameState {
  coins: number;
  slaHealth: number;
  currentWave: number;
  waveStatus: 'idle' | 'running' | 'wave_cleared' | 'game_over' | 'victory';
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  grid: GridTile[][];
  selectedTower: Tower | null;
  selectedTowerTypeToPlace: TowerType | null;
  gameSpeed: number;
  score: number;
  stats: {
    enemiesDefeated: number;
    coinsEarned: number;
    podsBuilt: number;
    upgradesCount: number;
  };
}

// Precompute path segments
interface PathSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  cumStart: number;
  cumEnd: number;
}

const SEGMENTS: PathSegment[] = [];
let totalPathLength = 0;

for (let i = 0; i < PATH_WAYPOINTS.length - 1; i++) {
  const p1 = PATH_WAYPOINTS[i];
  const p2 = PATH_WAYPOINTS[i + 1];
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  SEGMENTS.push({
    x1: p1.x,
    y1: p1.y,
    x2: p2.x,
    y2: p2.y,
    length: len,
    cumStart: totalPathLength,
    cumEnd: totalPathLength + len
  });
  totalPathLength += len;
}

export function getPathPosition(distance: number): { x: number; y: number; finished: boolean } {
  if (distance >= totalPathLength) {
    const last = PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1];
    return { x: last.x, y: last.y, finished: true };
  }

  for (const seg of SEGMENTS) {
    if (distance >= seg.cumStart && distance <= seg.cumEnd) {
      const segProgress = (distance - seg.cumStart) / seg.length;
      return {
        x: seg.x1 + (seg.x2 - seg.x1) * segProgress,
        y: seg.y1 + (seg.y2 - seg.y1) * segProgress,
        finished: false
      };
    }
  }

  const first = PATH_WAYPOINTS[0];
  return { x: first.x, y: first.y, finished: false };
}

// Generate 16x9 grid, detecting tiles intersected by the path
export function createGrid(): GridTile[][] {
  const grid: GridTile[][] = [];

  // Helper: check if cell bounds overlap any path segment with a margin
  const isCellOnPath = (c: number, r: number): boolean => {
    const cx = c * CELL_SIZE + CELL_SIZE / 2;
    const cy = r * CELL_SIZE + CELL_SIZE / 2;

    for (const seg of SEGMENTS) {
      // Line segment distance from (cx, cy) to segment
      const dx = seg.x2 - seg.x1;
      const dy = seg.y2 - seg.y1;
      const lenSq = dx * dx + dy * dy;
      let t = ((cx - seg.x1) * dx + (cy - seg.y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const projX = seg.x1 + t * dx;
      const projY = seg.y1 + t * dy;
      const dist = Math.hypot(cx - projX, cy - projY);

      if (dist < CELL_SIZE * 0.55) {
        return true;
      }
    }
    return false;
  };

  for (let r = 0; r < GRID_ROWS; r++) {
    const row: GridTile[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const onPath = isCellOnPath(c, r);
      row.push({
        col: c,
        row: r,
        isPath: onPath,
        isUnlocked: true
      });
    }
    grid.push(row);
  }

  return grid;
}

export class GameEngine {
  public state: GameState;
  private spawnQueue: Array<{
    type: keyof typeof ENEMY_CONFIGS;
    spawnTime: number;
  }> = [];
  private waveTimer: number = 0;

  constructor() {
    this.state = this.getInitialState();
  }

  public getInitialState(): GameState {
    return {
      coins: 280, // generous start: player can deploy 2 Pods + 1 Service immediately
      slaHealth: 100,
      currentWave: 1,
      waveStatus: 'idle',
      towers: [],
      enemies: [],
      projectiles: [],
      particles: [],
      floatingTexts: [],
      grid: createGrid(),
      selectedTower: null,
      selectedTowerTypeToPlace: null,
      gameSpeed: 1,
      score: 0,
      stats: {
        enemiesDefeated: 0,
        coinsEarned: 280,
        podsBuilt: 0,
        upgradesCount: 0
      }
    };
  }

  public resetGame() {
    this.state = this.getInitialState();
    this.spawnQueue = [];
    this.waveTimer = 0;
  }

  public setGameSpeed(speed: number) {
    this.state.gameSpeed = speed;
  }

  public selectTowerType(type: TowerType | null) {
    this.state.selectedTowerTypeToPlace = type;
    if (type !== null) {
      this.state.selectedTower = null;
    }
  }

  public selectTower(tower: Tower | null) {
    this.state.selectedTower = tower;
    if (tower !== null) {
      this.state.selectedTowerTypeToPlace = null;
    }
  }

  public startWave() {
    if (this.state.waveStatus === 'running') return;

    const waveDef = WAVES[this.state.currentWave - 1];
    if (!waveDef) return;

    this.spawnQueue = [];
    let cumulativeDelay = 0.5;

    for (const spawn of waveDef.enemySpawns) {
      for (let i = 0; i < spawn.count; i++) {
        cumulativeDelay += spawn.delaySec;
        this.spawnQueue.push({
          type: spawn.type,
          spawnTime: cumulativeDelay
        });
      }
    }

    this.waveTimer = 0;
    this.state.waveStatus = 'running';

    // Play sound alert
    if (waveDef.waveNumber === 8) {
      kubeSound.playBossAlert();
    } else {
      kubeSound.playWaveStart();
    }
  }

  public canPlaceTower(col: number, row: number, type: TowerType): boolean {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
    const cell = this.state.grid[row]?.[col];
    if (!cell || cell.isPath || cell.towerId) return false;

    const cost = TOWER_CONFIGS[type].cost;
    return this.state.coins >= cost;
  }

  public placeTower(col: number, row: number, type: TowerType): Tower | null {
    if (!this.canPlaceTower(col, row, type)) return null;

    const config = TOWER_CONFIGS[type];
    const x = col * CELL_SIZE + CELL_SIZE / 2;
    const y = row * CELL_SIZE + CELL_SIZE / 2;

    const newTower: Tower = {
      id: `tower-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      name: config.name,
      col,
      row,
      x,
      y,
      level: 1,
      replicas: 1,
      memoryLimit: 64,
      version: 'v1.0',
      range: config.range,
      damage: config.damage,
      fireRate: config.fireRate,
      lastShotTime: 0,
      cost: config.cost,
      totalInvested: config.cost
    };

    this.state.coins -= config.cost;
    this.state.towers.push(newTower);
    this.state.grid[row][col].towerId = newTower.id;
    this.state.stats.podsBuilt++;

    kubeSound.playPlaceTower();
    this.addFloatingText(x, y - 20, `-${config.cost} 🪙`, '#fbbf24');

    return newTower;
  }

  // Upgrade 1: Scale Replicas (kubectl scale deployment --replicas=N)
  public scaleReplicas(towerId: string): boolean {
    const tower = this.state.towers.find((t) => t.id === towerId);
    if (!tower || tower.type !== 'pod' || tower.replicas >= 4) return false;

    const upgradeCost = 100 * tower.replicas;
    if (this.state.coins < upgradeCost) return false;

    this.state.coins -= upgradeCost;
    tower.totalInvested += upgradeCost;
    tower.replicas += 1;
    tower.level += 1;
    this.state.stats.upgradesCount++;

    kubeSound.playUpgrade();
    this.addFloatingText(tower.x, tower.y - 25, `+1 REPLICA CANNON!`, '#38bdf8');
    this.createExplosionParticles(tower.x, tower.y, '#38bdf8', 12);
    return true;
  }

  // Upgrade 2: Tune Memory Limits (resources.limits.memory: 256Mi)
  public tuneMemoryLimits(towerId: string): boolean {
    const tower = this.state.towers.find((t) => t.id === towerId);
    if (!tower || tower.type !== 'pod' || tower.memoryLimit >= 512) return false;

    const upgradeCost = 80 * (tower.memoryLimit / 64);
    if (this.state.coins < upgradeCost) return false;

    this.state.coins -= upgradeCost;
    tower.totalInvested += upgradeCost;
    tower.memoryLimit = (tower.memoryLimit * 2) as 128 | 256 | 512;
    tower.damage += 10;
    this.state.stats.upgradesCount++;

    kubeSound.playUpgrade();
    this.addFloatingText(tower.x, tower.y - 25, `${tower.memoryLimit}Mi RAM LIMIT!`, '#c084fc');
    this.createExplosionParticles(tower.x, tower.y, '#c084fc', 12);
    return true;
  }

  // Upgrade 3: Rollout v2.0 (kubectl set image deployment app=v2.0)
  public rolloutV2(towerId: string): boolean {
    const tower = this.state.towers.find((t) => t.id === towerId);
    if (!tower || tower.type !== 'pod' || tower.version === 'v2.0') return false;

    const upgradeCost = 180;
    if (this.state.coins < upgradeCost) return false;

    this.state.coins -= upgradeCost;
    tower.totalInvested += upgradeCost;
    tower.version = 'v2.0';
    tower.damage = Math.floor(tower.damage * 1.8);
    tower.range += 25;
    this.state.stats.upgradesCount++;

    kubeSound.playUpgrade();
    this.addFloatingText(tower.x, tower.y - 25, `ROLLOUT v2.0 READY!`, '#34d399');
    this.createExplosionParticles(tower.x, tower.y, '#34d399', 16);
    return true;
  }

  // Upgrade 4: Generic Aura Upgrade for Service / Ingress / HPA
  public upgradeSupportTower(towerId: string): boolean {
    const tower = this.state.towers.find((t) => t.id === towerId);
    if (!tower || tower.type === 'pod' || tower.level >= 3) return false;

    const upgradeCost = 120 * tower.level;
    if (this.state.coins < upgradeCost) return false;

    this.state.coins -= upgradeCost;
    tower.totalInvested += upgradeCost;
    tower.level += 1;
    tower.range += 25;
    if (tower.damage > 0) tower.damage += 10;
    this.state.stats.upgradesCount++;

    kubeSound.playUpgrade();
    this.addFloatingText(tower.x, tower.y - 25, `LVL ${tower.level} EXPANDED!`, '#a78bfa');
    this.createExplosionParticles(tower.x, tower.y, '#a78bfa', 12);
    return true;
  }

  // Sell Tower (kubectl delete pod)
  public sellTower(towerId: string): boolean {
    const towerIndex = this.state.towers.findIndex((t) => t.id === towerId);
    if (towerIndex === -1) return false;

    const tower = this.state.towers[towerIndex];
    const refund = Math.floor(tower.totalInvested * 0.7);

    this.state.coins += refund;
    this.state.grid[tower.row][tower.col].towerId = undefined;
    this.state.towers.splice(towerIndex, 1);

    if (this.state.selectedTower?.id === towerId) {
      this.state.selectedTower = null;
    }

    kubeSound.playCoin();
    this.addFloatingText(tower.x, tower.y - 20, `+${refund} 🪙 REFUND`, '#fbbf24');
    return true;
  }

  public update(rawDeltaTime: number) {
    if (this.state.waveStatus !== 'running') return;

    // Cap delta time to prevent physics explosions on background tab switch
    const dt = Math.min(rawDeltaTime * this.state.gameSpeed, 0.08);
    this.waveTimer += dt;

    // 1. Spawn enemies from the queue
    for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
      const item = this.spawnQueue[i];
      if (this.waveTimer >= item.spawnTime) {
        this.spawnEnemy(item.type);
        this.spawnQueue.splice(i, 1);
      }
    }

    // 2. Compute HPA buffs on Pods
    const hpaTowers = this.state.towers.filter((t) => t.type === 'hpa');
    for (const tower of this.state.towers) {
      if (tower.type === 'pod') {
        const isBoosted = hpaTowers.some(
          (hpa) => Math.hypot(hpa.x - tower.x, hpa.y - tower.y) <= hpa.range
        );
        tower.hpaBoosted = isBoosted;
      }
    }

    // 3. Update Enemies
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];

      // Reset speed modifier if slow duration expired
      if (enemy.slowDuration > 0) {
        enemy.slowDuration -= dt;
        if (enemy.slowDuration <= 0) {
          enemy.speedModifier = 1.0;
        }
      }

      // Advance along path
      enemy.distanceTraveled += enemy.speed * enemy.speedModifier * dt;
      const pos = getPathPosition(enemy.distanceTraveled);
      enemy.x = pos.x;
      enemy.y = pos.y;

      // Check if reached Database Core (leak)
      if (pos.finished) {
        this.handleEnemyLeak(enemy);
        this.state.enemies.splice(i, 1);
        continue;
      }

      // Check if dead
      if (enemy.hp <= 0) {
        this.handleEnemyDefeated(enemy);
        this.state.enemies.splice(i, 1);
        continue;
      }
    }

    // 4. Update Towers (Firing & Support Auras)
    const now = performance.now() / 1000;

    for (const tower of this.state.towers) {
      // Service Tower: Round-Robin Slow Aura
      if (tower.type === 'service') {
        for (const enemy of this.state.enemies) {
          const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
          if (dist <= tower.range) {
            enemy.speedModifier = 0.55; // 45% slow
            enemy.slowDuration = 0.4;
            // Chip damage
            enemy.hp -= tower.damage * dt;
          }
        }
        continue;
      }

      // Ingress Gateway Tower: Decrypts & Weakens incoming packets
      if (tower.type === 'ingress') {
        for (const enemy of this.state.enemies) {
          const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
          if (dist <= tower.range && !enemy.isDecrypted) {
            enemy.isDecrypted = true;
            enemy.hp -= tower.damage;
            this.addFloatingText(enemy.x, enemy.y - 12, 'SSL DECRYPTED', '#c084fc');
            this.createExplosionParticles(enemy.x, enemy.y, '#c084fc', 4);
          }
        }
        continue;
      }

      // HPA Tower: Already computed aura
      if (tower.type === 'hpa') {
        continue;
      }

      // Pod Tower: Firing Lasers
      if (tower.type === 'pod') {
        const effectiveFireRate = tower.hpaBoosted ? tower.fireRate * 1.5 : tower.fireRate;
        const cooldown = 1.0 / effectiveFireRate;

        if (now - tower.lastShotTime >= cooldown) {
          // Find targets within range, prioritized by furthest along the track
          const inRangeEnemies = this.state.enemies
            .filter((e) => Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.range)
            .sort((a, b) => b.distanceTraveled - a.distanceTraveled);

          if (inRangeEnemies.length > 0) {
            // Pod fires up to `tower.replicas` simultaneous lasers!
            const targets = inRangeEnemies.slice(0, tower.replicas);
            let shotCount = 0;

            for (const target of targets) {
              this.fireLaser(tower, target);
              shotCount++;
            }

            tower.lastShotTime = now;
            kubeSound.playLaser(shotCount);
          }
        }
      }
    }

    // 5. Update Projectiles / Lasers
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const proj = this.state.projectiles[i];
      proj.progress += dt * 7.0; // lasers vanish fast
      if (proj.progress >= 1.0) {
        this.state.projectiles.splice(i, 1);
      }
    }

    // 6. Update Particles
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 1.8;
      if (p.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }

    // 7. Update Floating Texts
    for (let i = this.state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.state.floatingTexts[i];
      ft.y -= 30 * dt;
      ft.life -= dt * 1.4;
      if (ft.life <= 0) {
        this.state.floatingTexts.splice(i, 1);
      }
    }

    // 8. Check Wave Completion
    if (this.spawnQueue.length === 0 && this.state.enemies.length === 0) {
      this.handleWaveClear();
    }
  }

  private fireLaser(tower: Tower, target: Enemy) {
    let damage = tower.damage;

    // Bonus damage if enemy decrypted by Ingress
    if (target.isDecrypted) {
      damage = Math.floor(damage * 1.25);
    }

    // Bonus damage if Pod RAM limit is tuned for heavy payloads
    if (target.memoryWeight >= 80 && tower.memoryLimit >= 256) {
      damage = Math.floor(damage * 1.4);
    }

    target.hp -= damage;

    // Spawn Laser Beam projectile
    const beamColor =
      tower.version === 'v2.0' ? '#67e8f9' : tower.hpaBoosted ? '#34d399' : '#38bdf8';

    this.state.projectiles.push({
      id: `proj-${Date.now()}-${Math.random()}`,
      startX: tower.x,
      startY: tower.y,
      targetX: target.x,
      targetY: target.y,
      currentX: target.x,
      currentY: target.y,
      targetEnemyId: target.id,
      damage,
      color: beamColor,
      progress: 0,
      isLaserBeam: true
    });

    // Impact sparks
    this.createExplosionParticles(target.x, target.y, beamColor, 3);
  }

  private spawnEnemy(type: EnemyType) {
    const config = ENEMY_CONFIGS[type];
    const firstPos = PATH_WAYPOINTS[0];

    const enemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      name: config.name,
      x: firstPos.x,
      y: firstPos.y,
      distanceTraveled: 0,
      pathIndex: 0,
      hp: config.maxHp,
      maxHp: config.maxHp,
      speed: config.speed,
      speedModifier: 1.0,
      slowDuration: 0,
      reward: config.reward,
      memoryWeight: config.memoryWeight,
      color: config.color,
      size: config.size,
      isBoss: type === 'traffic-boss'
    };

    this.state.enemies.push(enemy);
  }

  private handleEnemyDefeated(enemy: Enemy) {
    this.state.coins += enemy.reward;
    this.state.score += enemy.reward * 10;
    this.state.stats.enemiesDefeated++;
    this.state.stats.coinsEarned += enemy.reward;

    kubeSound.playExplosion(enemy.isBoss);
    kubeSound.playCoin();

    this.addFloatingText(enemy.x, enemy.y - 15, `+${enemy.reward} 🪙`, '#fbbf24');
    this.createExplosionParticles(enemy.x, enemy.y, enemy.color, enemy.isBoss ? 35 : 12);
  }

  private handleEnemyLeak(enemy: Enemy) {
    const slaPenalty = enemy.isBoss ? 30 : enemy.type === 'api-post' ? 10 : 5;
    this.state.slaHealth = Math.max(0, this.state.slaHealth - slaPenalty);

    kubeSound.playLeakError();
    this.addFloatingText(
      CANVAS_WIDTH - 60,
      390 - 20,
      `-${slaPenalty}% SLA!`,
      '#ef4444'
    );
    this.createExplosionParticles(CANVAS_WIDTH - 30, 390, '#ef4444', 16);

    if (this.state.slaHealth <= 0) {
      this.state.waveStatus = 'game_over';
      ytPlayables.sendScore({ value: this.state.score });
    }
  }

  private handleWaveClear() {
    const waveDef = WAVES[this.state.currentWave - 1];
    const bonus = waveDef ? waveDef.rewardBonus : 100;

    this.state.coins += bonus;
    this.state.score += bonus * 15;
    this.state.stats.coinsEarned += bonus;

    kubeSound.playWaveWin();
    this.addFloatingText(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 40,
      `WAVE ${this.state.currentWave} CLEARED! +${bonus} 🪙`,
      '#4ade80'
    );

    ytPlayables.sendScore({ value: this.state.score });

    if (this.state.currentWave >= WAVES.length) {
      this.state.waveStatus = 'victory';
    } else {
      this.state.waveStatus = 'wave_cleared';
    }
  }

  public advanceToNextWave() {
    if (this.state.currentWave < WAVES.length) {
      this.state.currentWave++;
      this.state.waveStatus = 'idle';
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.state.floatingTexts.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      x,
      y,
      text,
      color,
      life: 1.0
    });
  }

  private createExplosionParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.state.particles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: 2 + Math.random() * 3
      });
    }
  }
}
