import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawPixelHero, drawDungeonBackground } from '../game/spriteRenderer';
import { sound } from '../audio/soundEffects';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Play, RefreshCw, Eye } from 'lucide-react';

export default function GameCanvas({
  activeMission,
  onTriggerAlgorithm,
  isExecuting,
  executionSteps,
  currentStepIndex,
  missionState,
  setMissionState,
}) {
  const canvasRef = useRef(null);
  
  // Hero state
  const heroRef = useRef({
    x: 400,
    y: 250,
    vx: 0,
    vy: 0,
    speed: 3.5,
    direction: 'down',
    frame: 0,
    animTimer: 0,
    isMoving: false,
    isCasting: false,
  });

  const keysPressed = useRef({});

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid scrolling on arrow keys and space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      keysPressed.current[e.code] = true;

      if (e.code === 'Space' || e.code === 'KeyE') {
        heroRef.current.isCasting = true;
        onTriggerAlgorithm();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.code] = false;
      if (e.code === 'Space' || e.code === 'KeyE') {
        setTimeout(() => {
          heroRef.current.isCasting = false;
        }, 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onTriggerAlgorithm]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const hero = heroRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Update hero movement
      let dx = 0;
      let dy = 0;

      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) dy -= 1;
      if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) dy += 1;
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) dx -= 1;
      if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) dx += 1;

      hero.isMoving = dx !== 0 || dy !== 0;

      if (hero.isMoving) {
        // Normalize diagonal speed
        const length = Math.sqrt(dx * dx + dy * dy);
        hero.x += (dx / length) * hero.speed;
        hero.y += (dy / length) * hero.speed;

        // Determine direction
        if (Math.abs(dx) > Math.abs(dy)) {
          hero.direction = dx > 0 ? 'right' : 'left';
        } else {
          hero.direction = dy > 0 ? 'down' : 'up';
        }

        // Animate walk frames
        hero.animTimer++;
        if (hero.animTimer % 8 === 0) {
          hero.frame = (hero.frame + 1) % 4;
          if (hero.animTimer % 16 === 0) {
            sound.playStep();
          }
        }
      } else {
        hero.frame = 0;
      }

      // Constrain hero inside canvas borders
      const margin = 30;
      hero.x = Math.max(margin, Math.min(width - margin, hero.x));
      hero.y = Math.max(margin, Math.min(height - margin, hero.y));

      // 1. Draw Dungeon Floor
      drawDungeonBackground(ctx, width, height);

      // 2. Draw Mission Specific Visuals
      drawMissionLayer(ctx, width, height, activeMission, missionState, executionSteps, currentStepIndex);

      // 3. Draw Player Hero
      drawPixelHero(ctx, hero.x, hero.y, hero.direction, hero.frame, hero.isCasting);

      // 4. Draw Floating UI Tips on Canvas
      drawCanvasOverlay(ctx, width, height, hero);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeMission, missionState, executionSteps, currentStepIndex]);

  // Helper to draw mission specifics
  const drawMissionLayer = (ctx, width, height, missionId, state, steps, stepIdx) => {
    // Current step data if animating
    const currentStep = steps && stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

    if (missionId === 1) {
      // Mission 1: Closest Pair of Points
      drawClosestPairVisuals(ctx, width, height, state, currentStep);
    } else if (missionId === 2) {
      // Mission 2: Skyline Problem
      drawSkylineVisuals(ctx, width, height, state, currentStep);
    } else if (missionId === 3) {
      // Mission 3: Inversion Counting
      drawInversionVisuals(ctx, width, height, state, currentStep);
    } else if (missionId === 4) {
      // Mission 4: QuickSelect
      drawQuickSelectVisuals(ctx, width, height, state, currentStep);
    }
  };

  const drawClosestPairVisuals = (ctx, width, height, state, currentStep) => {
    const points = state?.points || [];
    const bestPair = state?.bestPair;

    // Draw active D&C division line if currently stepping
    if (currentStep?.data?.splitX) {
      const sx = currentStep.data.splitX;
      ctx.save();
      ctx.strokeStyle = '#00d2d3';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, 10);
      ctx.lineTo(sx, height - 10);
      ctx.stroke();

      // Label line
      ctx.fillStyle = '#00d2d3';
      ctx.font = '10px "Press Start 2P"';
      ctx.fillText(`DIVISÃO X=${Math.round(sx)}`, sx + 6, 25);
      ctx.restore();
    }

    // Draw strip boundaries
    if (currentStep?.data?.splitX && currentStep?.data?.delta) {
      const { splitX, delta } = currentStep.data;
      ctx.save();
      ctx.fillStyle = 'rgba(233, 69, 96, 0.12)';
      ctx.fillRect(splitX - delta, 10, delta * 2, height - 20);
      ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(splitX - delta, 10, delta * 2, height - 20);
      ctx.restore();
    }

    // Draw points (Projectiles / Magic Orbs)
    points.forEach((p, idx) => {
      ctx.save();
      const isSelected = bestPair && (p.id === bestPair[0]?.id || p.id === bestPair[1]?.id);

      // Pulse ring for points
      ctx.fillStyle = isSelected ? '#ff4757' : '#2ed573';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isSelected ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();

      // Pixel border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Coordinates tooltip
      ctx.fillStyle = '#a4b0be';
      ctx.font = '8px "VT323"';
      ctx.fillText(`#${idx + 1}`, p.x + 8, p.y - 4);
      ctx.restore();
    });

    // Draw laser beam connecting closest pair
    if (bestPair && bestPair[0] && bestPair[1]) {
      ctx.save();
      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(bestPair[0].x, bestPair[0].y);
      ctx.lineTo(bestPair[1].x, bestPair[1].y);
      ctx.stroke();

      // Beam glow
      ctx.strokeStyle = 'rgba(255, 71, 87, 0.4)';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Explosion spark at center
      const cx = (bestPair[0].x + bestPair[1].x) / 2;
      const cy = (bestPair[0].y + bestPair[1].y) / 2;
      ctx.fillStyle = '#f9ca24';
      ctx.font = '10px "Press Start 2P"';
      ctx.fillText(`⚡ PAR MAIS PRÓXIMO!`, cx - 70, cy - 12);
      ctx.restore();
    }
  };

  const drawSkylineVisuals = (ctx, width, height, state, currentStep) => {
    // Skyline ground
    const groundY = height - 50;
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, groundY, width, 50);

    const buildings = state?.buildings || [];
    const skylinePoints = state?.skyline || [];

    // Draw individual buildings semi-transparent
    buildings.forEach((b, i) => {
      const colors = ['rgba(52, 73, 94, 0.4)', 'rgba(41, 128, 185, 0.4)', 'rgba(142, 68, 173, 0.4)'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(b.left, groundY - b.height, b.right - b.left, b.height);
      ctx.strokeStyle = '#7f8c8d';
      ctx.strokeRect(b.left, groundY - b.height, b.right - b.left, b.height);
    });

    // Draw final Skyline silhouette outline
    if (skylinePoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00d2d3';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      let currX = skylinePoints[0].x;
      let currH = skylinePoints[0].h;
      ctx.moveTo(currX, groundY);
      ctx.lineTo(currX, groundY - currH);

      for (let i = 1; i < skylinePoints.length; i++) {
        const nextX = skylinePoints[i].x;
        const nextH = skylinePoints[i].h;
        ctx.lineTo(nextX, groundY - currH);
        ctx.lineTo(nextX, groundY - nextH);
        currH = nextH;
      }

      ctx.stroke();

      // Golden Goal / Chest at the end of skyline
      const lastPoint = skylinePoints[skylinePoints.length - 1];
      ctx.fillStyle = '#f9ca24';
      ctx.font = '20px monospace';
      ctx.fillText('🏆', (lastPoint?.x || width - 80) + 10, groundY - 10);
      ctx.restore();
    }
  };

  const drawInversionVisuals = (ctx, width, height, state, currentStep) => {
    const array = state?.array || [];
    const inversions = state?.inversions ?? 0;
    const startX = 40;
    const cardW = 54;
    const cardH = 68;
    const baseY = 175;

    // Draw Chaos Boss in background
    ctx.save();
    const isBossHit = currentStep?.type === 'INVERSION_FOUND';
    ctx.font = isBossHit ? '48px monospace' : '42px monospace';
    ctx.fillText('👹', width / 2 - 25, 85);

    ctx.fillStyle = isBossHit ? '#ff4757' : '#e94560';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`BOSS DE CAOS // INVERSÕES: ${inversions}`, width / 2 - 130, 115);

    if (isBossHit) {
      // Hit spark effect
      ctx.fillStyle = '#f9ca24';
      ctx.font = '12px "Press Start 2P"';
      ctx.fillText(`-CRÍTICO! +${currentStep.data?.countAdded || 1} INVERSÕES`, width / 2 - 120, 50);
    }
    ctx.restore();

    // Draw Active Recursion status
    if (currentStep?.message) {
      ctx.save();
      ctx.fillStyle = '#00d2d3';
      ctx.font = '9px "Press Start 2P"';
      ctx.fillText(`RECURSÃO: ${currentStep.type}`, startX, baseY - 20);
      ctx.restore();
    }

    // Draw Rune cards
    array.forEach((val, i) => {
      const cx = startX + i * (cardW + 10);
      ctx.save();

      const isHighlight = currentStep?.data?.merged?.includes(val);
      ctx.fillStyle = isHighlight ? '#1a2a3a' : '#1e272e';
      ctx.strokeStyle = isHighlight ? '#00d2d3' : '#f9ca24';
      ctx.lineWidth = isHighlight ? 4 : 2;
      ctx.fillRect(cx, baseY, cardW, cardH);
      ctx.strokeRect(cx, baseY, cardW, cardH);

      // Card value
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px "Press Start 2P"';
      ctx.fillText(String(val), cx + 16, baseY + 42);

      // Index label
      ctx.fillStyle = '#a4b0be';
      ctx.font = '9px "VT323"';
      ctx.fillText(`slot ${i}`, cx + 12, baseY + cardH + 14);
      ctx.restore();
    });
  };

  const drawQuickSelectVisuals = (ctx, width, height, state, currentStep) => {
    const monsters = state?.monsters || [];
    const targetK = state?.targetK ?? 3;
    const targetFound = state?.targetFound;
    const startX = 50;

    ctx.save();
    ctx.fillStyle = '#f9ca24';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`OBJETIVO: Encontrar o ${targetK}º Monstro mais forte com QuickSelect`, startX, 40);
    ctx.restore();

    monsters.forEach((m, i) => {
      const x = startX + i * 58;
      const y = 140;
      const isTarget = targetFound && targetFound.id === m.id;
      const isEliminated = m.eliminated;

      ctx.save();
      ctx.globalAlpha = isEliminated ? 0.25 : 1.0;

      // Draw monster avatar
      ctx.font = '24px monospace';
      ctx.fillText(isTarget ? '👑' : '👾', x, y);

      // Power badge
      ctx.fillStyle = isTarget ? '#f9ca24' : '#00d2d3';
      ctx.fillRect(x - 5, y + 8, 36, 16);
      ctx.fillStyle = '#000000';
      ctx.font = '10px "Press Start 2P"';
      ctx.fillText(String(m.power), x, y + 20);
      ctx.restore();
    });
  };

  const drawCanvasOverlay = (ctx, width, height, hero) => {
    // Controls overlay badge in top right
    ctx.save();
    ctx.fillStyle = 'rgba(10, 10, 20, 0.75)';
    ctx.fillRect(width - 210, 12, 198, 55);
    ctx.strokeStyle = '#39395f';
    ctx.lineWidth = 2;
    ctx.strokeRect(width - 210, 12, 198, 55);

    ctx.fillStyle = '#00d2d3';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('CONTROLES:', width - 200, 28);
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText('WASD / SETAS: Mover', width - 200, 42);
    ctx.fillStyle = '#f9ca24';
    ctx.fillText('ESPAÇO: Magia D&C', width - 200, 56);
    ctx.restore();
  };

  // Virtual D-Pad buttons for mobile / mouse interaction
  const handleVirtualMove = (direction) => {
    const hero = heroRef.current;
    hero.direction = direction;
    hero.isMoving = true;
    hero.frame = (hero.frame + 1) % 4;
    sound.playStep();

    const step = 20;
    if (direction === 'up') hero.y -= step;
    if (direction === 'down') hero.y += step;
    if (direction === 'left') hero.x -= step;
    if (direction === 'right') hero.x += step;

    setTimeout(() => {
      hero.isMoving = false;
    }, 150);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 2D Pixel Canvas */}
      <div className="relative border-4 border-[#39395f] shadow-pixel-lg bg-black overflow-hidden rounded-sm">
        <canvas
          ref={canvasRef}
          width={760}
          height={420}
          className="block max-w-full h-auto cursor-crosshair"
          onClick={() => {
            heroRef.current.isCasting = true;
            onTriggerAlgorithm();
            setTimeout(() => {
              heroRef.current.isCasting = false;
            }, 300);
          }}
        />

        {/* Action Trigger Banner */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <button
            onClick={() => onTriggerAlgorithm()}
            disabled={isExecuting}
            className="pixel-btn bg-[#e94560] text-white hover:bg-[#ff5e78] border-black flex items-center gap-2 shadow-pixel"
          >
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            <span>{isExecuting ? 'EXECUTANDO...' : 'CONJURAR ALGORITMO [ESPAÇO]'}</span>
          </button>
        </div>
      </div>

      {/* On-Screen Mobile / Mouse Controls Pad */}
      <div className="mt-4 flex items-center justify-between w-full max-w-[760px] px-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[9px] text-gray-400">D-PAD VIRTUAL:</span>
          <button
            onClick={() => handleVirtualMove('left')}
            className="p-2 bg-[#1f1f38] border-2 border-[#39395f] hover:bg-[#2e2e54] text-white shadow-pixel-sm active:translate-y-0.5"
            title="Esquerda"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleVirtualMove('up')}
              className="p-2 bg-[#1f1f38] border-2 border-[#39395f] hover:bg-[#2e2e54] text-white shadow-pixel-sm active:translate-y-0.5"
              title="Cima"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleVirtualMove('down')}
              className="p-2 bg-[#1f1f38] border-2 border-[#39395f] hover:bg-[#2e2e54] text-white shadow-pixel-sm active:translate-y-0.5"
              title="Baixo"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => handleVirtualMove('right')}
            className="p-2 bg-[#1f1f38] border-2 border-[#39395f] hover:bg-[#2e2e54] text-white shadow-pixel-sm active:translate-y-0.5"
            title="Direita"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-right font-retro text-sm text-gray-400">
          💡 Clique ou aperte <span className="text-[#00d2d3]">ESPAÇO</span> para ativar a habilidade D&C
        </div>
      </div>
    </div>
  );
}
