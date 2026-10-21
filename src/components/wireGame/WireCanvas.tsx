import React, { useEffect, useRef, useState } from 'react';
import type { WireEngine } from '../../wireGame/engine';
import type { WireNode } from '../../wireGame/types';

interface WireCanvasProps {
  engine: WireEngine;
  onSelectWire: (wireId: string | null) => void;
}

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

// Helper: Bezier cubic interpolation
function getBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const oneMinusT = 1 - t;
  const x =
    Math.pow(oneMinusT, 3) * p0.x +
    3 * Math.pow(oneMinusT, 2) * t * p1.x +
    3 * oneMinusT * Math.pow(t, 2) * p2.x +
    Math.pow(t, 3) * p3.x;
  const y =
    Math.pow(oneMinusT, 3) * p0.y +
    3 * Math.pow(oneMinusT, 2) * t * p1.y +
    3 * oneMinusT * Math.pow(t, 2) * p2.y +
    Math.pow(t, 3) * p3.y;
  return { x, y };
}

// Compute natural cable sag control points
function getControlPoints(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const curvature = Math.min(60, dist * 0.2);

  return {
    cp1: { x: x1 + dx * 0.35, y: y1 + dy * 0.15 + curvature },
    cp2: { x: x1 + dx * 0.65, y: y1 + dy * 0.85 + curvature }
  };
}

export const WireCanvas: React.FC<WireCanvasProps> = ({ engine, onSelectWire }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let pulseTime = 0;

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      pulseTime += dt * 3;

      // Update Engine
      engine.update(dt);

      // Clear Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. Draw Schematic Grid Background
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Blueprint Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // 2. Draw Connected Wires
      for (const wire of engine.state.wires) {
        const fromNode = engine.state.nodes.find((n) => n.id === wire.fromNodeId);
        const toNode = engine.state.nodes.find((n) => n.id === wire.toNodeId);
        if (!fromNode || !toNode) continue;

        const isSelected = engine.state.selectedWireId === wire.id;
        const { cp1, cp2 } = getControlPoints(fromNode.x, fromNode.y, toNode.x, toNode.y);

        // Cable Glow
        ctx.save();
        ctx.strokeStyle = isSelected ? '#fbbf24' : wire.color;
        ctx.shadowColor = isSelected ? '#fbbf24' : wire.color;
        ctx.shadowBlur = isSelected ? 12 : 8;
        ctx.lineWidth = isSelected ? 4 : 2.5;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, toNode.x, toNode.y);
        ctx.stroke();
        ctx.restore();

        // If selected, draw scissors cut badge at midpoint
        if (isSelected) {
          const mid = getBezierPoint(fromNode, cp1, cp2, toNode, 0.5);
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(mid.x, mid.y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✕', mid.x, mid.y);
          ctx.restore();
        }
      }

      // 3. Draw Live Dragging Wire
      if (engine.state.dragWire) {
        const fromNode = engine.state.nodes.find((n) => n.id === engine.state.dragWire?.fromNodeId);
        if (fromNode) {
          const targetX = engine.state.dragWire.mouseX;
          const targetY = engine.state.dragWire.mouseY;
          const { cp1, cp2 } = getControlPoints(fromNode.x, fromNode.y, targetX, targetY);

          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, targetX, targetY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }

      // 4. Draw Traveling Data Packets along Wires
      for (const pkt of engine.state.packets) {
        const fromNode = engine.state.nodes.find((n) => n.id === pkt.fromNodeId);
        const toNode = engine.state.nodes.find((n) => n.id === pkt.toNodeId);
        if (!fromNode || !toNode) continue;

        const { cp1, cp2 } = getControlPoints(fromNode.x, fromNode.y, toNode.x, toNode.y);
        const pos = getBezierPoint(fromNode, cp1, cp2, toNode, pkt.progress);

        ctx.save();
        ctx.fillStyle = pkt.color;
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Draw Kubernetes Nodes
      for (const node of engine.state.nodes) {
        drawNode(ctx, node, hoveredNodeId === node.id, pulseTime);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, hoveredNodeId]);

  // Mouse / Touch Event Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    // 1. Check if clicked scissors / delete icon on selected wire
    if (engine.state.selectedWireId) {
      const selectedWire = engine.state.wires.find((w) => w.id === engine.state.selectedWireId);
      if (selectedWire) {
        const from = engine.state.nodes.find((n) => n.id === selectedWire.fromNodeId);
        const to = engine.state.nodes.find((n) => n.id === selectedWire.toNodeId);
        if (from && to) {
          const { cp1, cp2 } = getControlPoints(from.x, from.y, to.x, to.y);
          const mid = getBezierPoint(from, cp1, cp2, to, 0.5);
          if (Math.hypot(x - mid.x, y - mid.y) <= 16) {
            engine.removeWire(selectedWire.id);
            onSelectWire(null);
            return;
          }
        }
      }
    }

    // 2. Check if clicked a node to start dragging wire
    const clickedNode = engine.state.nodes.find(
      (n) => Math.hypot(n.x - x, n.y - y) <= n.radius + 6
    );

    if (clickedNode) {
      engine.startDragWire(clickedNode.id, x, y);
      onSelectWire(null);
      return;
    }

    // 3. Check if clicked an existing wire to select it
    for (const wire of engine.state.wires) {
      const from = engine.state.nodes.find((n) => n.id === wire.fromNodeId);
      const to = engine.state.nodes.find((n) => n.id === wire.toNodeId);
      if (from && to) {
        const { cp1, cp2 } = getControlPoints(from.x, from.y, to.x, to.y);
        const mid = getBezierPoint(from, cp1, cp2, to, 0.5);
        if (Math.hypot(x - mid.x, y - mid.y) <= 20) {
          engine.state.selectedWireId = wire.id;
          onSelectWire(wire.id);
          return;
        }
      }
    }

    // Clicked empty ground: deselect
    engine.state.selectedWireId = null;
    onSelectWire(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    // Update drag wire
    if (engine.state.dragWire) {
      engine.updateDragWire(x, y);
    }

    // Check hover node
    const hovered = engine.state.nodes.find(
      (n) => Math.hypot(n.x - x, n.y - y) <= n.radius + 6
    );
    setHoveredNodeId(hovered ? hovered.id : null);
  };

  const handleMouseUp = () => {
    if (engine.state.dragWire) {
      engine.endDragWire(hoveredNodeId);
    }
  };

  return (
    <div className="relative w-full aspect-[16/9] max-w-[1040px] mx-auto rounded-xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-blue-950/40 bg-slate-950 select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
};

// --- Node Drawing Helper ---
function drawNode(
  ctx: CanvasRenderingContext2D,
  node: WireNode,
  isHovered: boolean,
  pulseTime: number
) {
  ctx.save();
  ctx.translate(node.x, node.y);

  // Outer Pulse Halo if hovered or dragging
  if (isHovered) {
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, node.radius + 8 + Math.sin(pulseTime * 4) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Node Base Circle / Card
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = isHovered ? '#ffffff' : node.color;
  ctx.lineWidth = 3;
  ctx.shadowColor = node.color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Node Center Icon
  ctx.font = '20px "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.icon, 0, -2);

  // Queue Dots / Meter (if node holds queue)
  if (node.maxQueue > 0 && node.queue.length > 0) {
    const queueRatio = node.queue.length / node.maxQueue;
    const barWidth = node.radius * 1.5;
    const barHeight = 4;
    const barY = node.radius + 6;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

    ctx.fillStyle =
      queueRatio > 0.8 ? '#ef4444' : queueRatio > 0.5 ? '#f59e0b' : '#10b981';
    ctx.fillRect(-barWidth / 2, barY, barWidth * queueRatio, barHeight);
  }

  // Node Name & Labels below
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(node.name, 0, node.radius + 20);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px monospace';
  ctx.fillText(node.subtitle, 0, node.radius + 32);

  ctx.restore();
}
