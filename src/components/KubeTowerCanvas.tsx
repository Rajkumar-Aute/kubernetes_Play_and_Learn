import React, { useEffect, useRef, useState } from 'react';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_SIZE,
  GRID_COLS,
  GRID_ROWS,
  PATH_WAYPOINTS,
  TOWER_CONFIGS
} from '../game/constants';
import type { GameEngine } from '../game/engine';
import type { Tower, Enemy } from '../game/types';

interface KubeTowerCanvasProps {
  engine: GameEngine;
  onSelectTower: (tower: Tower | null) => void;
}

export const KubeTowerCanvas: React.FC<KubeTowerCanvasProps> = ({ engine, onSelectTower }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ col: number; row: number } | null>(null);

  // High-performance requestAnimationFrame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let pulseAnim = 0;

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      pulseAnim += dt * 3;

      // Update game simulation
      engine.update(dt);

      // Clear Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. Draw Circuit Grid Background
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle grid dots/lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      for (let c = 0; c <= GRID_COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * CELL_SIZE, 0);
        ctx.lineTo(c * CELL_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let r = 0; r <= GRID_ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * CELL_SIZE);
        ctx.lineTo(CANVAS_WIDTH, r * CELL_SIZE);
        ctx.stroke();
      }

      // 2. Draw Circuit Traffic Bus (Path)
      // Outer track bed
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 42;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(PATH_WAYPOINTS[0].x, PATH_WAYPOINTS[0].y);
      for (let i = 1; i < PATH_WAYPOINTS.length; i++) {
        ctx.lineTo(PATH_WAYPOINTS[i].x, PATH_WAYPOINTS[i].y);
      }
      ctx.stroke();

      // Inner electric neon glow lane
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 16;
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Animated traveling data pulse dots on the circuit wire
      const pulsePhase = (pulseAnim * 20) % 60;
      ctx.setLineDash([12, 48]);
      ctx.lineDashOffset = -pulsePhase;
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.setLineDash([]); // reset dash

      // 3. Draw Ingress Gateway Entrance Portal
      const entrance = PATH_WAYPOINTS[0];
      ctx.save();
      ctx.translate(entrance.x + 15, entrance.y);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('INGRESS', 0, -30);
      ctx.fillText('GATEWAY', 0, -20);
      ctx.restore();

      // 4. Draw Database Core Exit Portal
      const exit = PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1];
      ctx.save();
      ctx.translate(exit.x - 18, exit.y);
      const isLowSla = engine.state.slaHealth < 30;
      ctx.strokeStyle = isLowSla ? '#ef4444' : '#10b981';
      ctx.lineWidth = 4;
      ctx.fillStyle = isLowSla ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Server rack icon inside database core
      ctx.fillStyle = isLowSla ? '#f87171' : '#34d399';
      ctx.fillRect(-10, -12, 20, 7);
      ctx.fillRect(-10, -3, 20, 7);
      ctx.fillRect(-10, 6, 20, 7);

      ctx.fillStyle = '#ecfdf5';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DATABASE', 0, -32);
      ctx.fillText('CORE', 0, -22);
      ctx.restore();

      // 5. Draw Tile Highlights & Placement Range Preview
      if (hoveredTile && engine.state.selectedTowerTypeToPlace) {
        const type = engine.state.selectedTowerTypeToPlace;
        const canPlace = engine.canPlaceTower(hoveredTile.col, hoveredTile.row, type);
        const config = TOWER_CONFIGS[type];
        const cx = hoveredTile.col * CELL_SIZE + CELL_SIZE / 2;
        const cy = hoveredTile.row * CELL_SIZE + CELL_SIZE / 2;

        // Tile Box
        ctx.fillStyle = canPlace ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        ctx.strokeStyle = canPlace ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.fillRect(hoveredTile.col * CELL_SIZE, hoveredTile.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(hoveredTile.col * CELL_SIZE, hoveredTile.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // Range Circle Preview
        ctx.beginPath();
        ctx.arc(cx, cy, config.range, 0, Math.PI * 2);
        ctx.fillStyle = canPlace ? 'rgba(56, 189, 248, 0.12)' : 'rgba(239, 68, 68, 0.1)';
        ctx.fill();
        ctx.strokeStyle = canPlace ? 'rgba(56, 189, 248, 0.5)' : 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 6. Draw Selected Tower Range & Ring
      if (engine.state.selectedTower) {
        const t = engine.state.selectedTower;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulsing selection brackets
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        const pad = CELL_SIZE / 2 + 3;
        ctx.strokeRect(t.x - pad, t.y - pad, pad * 2, pad * 2);
      }

      // 7. Draw Towers
      for (const tower of engine.state.towers) {
        drawTower(ctx, tower, pulseAnim);
      }

      // 8. Draw Laser Beams / Projectiles
      for (const proj of engine.state.projectiles) {
        if (proj.isLaserBeam) {
          ctx.save();
          ctx.strokeStyle = proj.color;
          ctx.lineWidth = Math.max(1, 4 * (1 - proj.progress));
          ctx.shadowColor = proj.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(proj.startX, proj.startY);
          ctx.lineTo(proj.targetX, proj.targetY);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 9. Draw Enemies
      for (const enemy of engine.state.enemies) {
        drawEnemy(ctx, enemy);
      }

      // 10. Draw Particles
      for (const p of engine.state.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 11. Draw Floating Texts
      for (const ft of engine.state.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 6;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [engine, hoveredTile]);

  // Click & Touch handling
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(clickX / CELL_SIZE);
    const row = Math.floor(clickY / CELL_SIZE);

    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;

    // Check if clicked an existing tower
    const existingTower = engine.state.towers.find((t) => t.col === col && t.row === row);
    if (existingTower) {
      engine.selectTower(existingTower);
      onSelectTower(existingTower);
      return;
    }

    // If a tower type is selected in shop, attempt placement
    if (engine.state.selectedTowerTypeToPlace) {
      const placed = engine.placeTower(col, row, engine.state.selectedTowerTypeToPlace);
      if (placed) {
        engine.selectTower(placed);
        onSelectTower(placed);
      }
      return;
    }

    // Deselect if clicked empty ground
    engine.selectTower(null);
    onSelectTower(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(mouseX / CELL_SIZE);
    const row = Math.floor(mouseY / CELL_SIZE);

    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      setHoveredTile({ col, row });
    } else {
      setHoveredTile(null);
    }
  };

  return (
    <div className="relative w-full aspect-[16/9] max-w-[1040px] mx-auto rounded-xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-cyan-950/40 bg-slate-950 select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredTile(null)}
        className="w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
};

// --- Tower Drawing Helper ---
function drawTower(ctx: CanvasRenderingContext2D, tower: Tower, pulseAnim: number) {
  ctx.save();
  ctx.translate(tower.x, tower.y);

  if (tower.type === 'pod') {
    // Pod Base (Hexagon)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = tower.version === 'v2.0' ? '#38bdf8' : '#0284c7';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = Math.cos(angle) * 22;
      const hy = Math.sin(angle) * 22;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // HPA Overdrive Aura (Green pulse)
    if (tower.hpaBoosted) {
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 26 + Math.sin(pulseAnim * 3) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Pod Core Glow
    ctx.fillStyle = tower.version === 'v2.0' ? '#67e8f9' : '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Laser Cannons according to Replicas (1 to 4)
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (let r = 0; r < tower.replicas; r++) {
      const turretAngle = (r * (Math.PI * 2)) / tower.replicas - Math.PI / 2;
      const barrelLen = 16;
      ctx.beginPath();
      ctx.moveTo(Math.cos(turretAngle) * 8, Math.sin(turretAngle) * 8);
      ctx.lineTo(Math.cos(turretAngle) * barrelLen, Math.sin(turretAngle) * barrelLen);
      ctx.stroke();
    }

    // RAM badge text (e.g. 64M, 256M)
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${tower.memoryLimit}M`, 0, 18);
  } else if (tower.type === 'service') {
    // Service Tower: Rhombus Load Balancer with Orbiting Satellites
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(22, 0);
    ctx.lineTo(0, 22);
    ctx.lineTo(-22, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pulsing Round-Robin Slow Aura Ring
    const auraPulse = (pulseAnim * 15) % 35;
    ctx.strokeStyle = `rgba(99, 102, 241, ${0.7 - auraPulse / 40})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 20 + auraPulse, 0, Math.PI * 2);
    ctx.stroke();

    // 3 Orbiting Satellites
    for (let s = 0; s < 3; s++) {
      const satAngle = pulseAnim * 2 + (s * Math.PI * 2) / 3;
      const sx = Math.cos(satAngle) * 14;
      const sy = Math.sin(satAngle) * 14;
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#c7d2fe';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SVC', 0, 3);
  } else if (tower.type === 'ingress') {
    // Ingress Gateway Archway
    ctx.fillStyle = '#2e1065';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, -4, 18, Math.PI, 0, false);
    ctx.lineTo(18, 18);
    ctx.lineTo(-18, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // SSL Decrypt Core
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(0, 2, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f3e8ff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SSL', 0, 14);
  } else if (tower.type === 'hpa') {
    // HPA Autoscaler: Satellite Radar Dish
    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sweeping Radar Line
    const radarAngle = pulseAnim * 3;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(radarAngle) * 19, Math.sin(radarAngle) * 19);
    ctx.stroke();

    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HPA', 0, 4);
  }

  ctx.restore();
}

// --- Enemy Drawing Helper ---
function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  // Health Bar
  const barWidth = Math.max(22, enemy.size * 2);
  const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(-barWidth / 2, -enemy.size - 10, barWidth, 4);
  ctx.fillStyle = hpRatio > 0.5 ? '#10b981' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(-barWidth / 2, -enemy.size - 10, barWidth * hpRatio, 4);

  // Decrypted / Weakened Shield Indicator
  if (enemy.isDecrypted) {
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-enemy.size - 3, -enemy.size - 3, (enemy.size + 3) * 2, (enemy.size + 3) * 2);
  }

  // Draw Specific Enemy Bodies
  if (enemy.type === 'http-get') {
    // Cyan Capsule
    ctx.fillStyle = enemy.color;
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GET', 0, 0);
  } else if (enemy.type === 'api-post') {
    // Heavy Armored Box
    ctx.fillStyle = '#581c87';
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(-enemy.size, -enemy.size, enemy.size * 2, enemy.size * 2);
    ctx.strokeRect(-enemy.size, -enemy.size, enemy.size * 2, enemy.size * 2);

    ctx.fillStyle = '#f3e8ff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POST', 0, 0);
  } else if (enemy.type === 'ddos-swarm') {
    // Fast Spiky Red Bug
    ctx.fillStyle = enemy.color;
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, -enemy.size);
    ctx.lineTo(enemy.size, 0);
    ctx.lineTo(0, enemy.size);
    ctx.lineTo(-enemy.size, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 0, 0);
  } else if (enemy.type === 'traffic-boss') {
    // Mega Black Friday Boss
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 18;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const bx = Math.cos(angle) * enemy.size;
      const by = Math.sin(angle) * enemy.size;
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOSS', 0, 0);
  }

  ctx.restore();
}
