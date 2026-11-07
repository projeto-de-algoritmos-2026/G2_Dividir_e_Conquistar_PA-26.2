import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawCharacter, drawDungeonBackground } from '../game/spriteRenderer';
import { sound } from '../audio/soundEffects';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Play, RefreshCw, Eye } from 'lucide-react';

export default function GameCanvas({
  activeMission,
  setActiveMission,
  onTriggerAlgorithm,
  isExecuting,
  executionSteps,
  currentStepIndex,
  missionState,
  setMissionState,
  onHeroPositionChange,
  onCollectChest,
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

      if (hero.isMoving && onHeroPositionChange && hero.animTimer % 15 === 0) {
        onHeroPositionChange({ x: hero.x, y: hero.y });
      }

      // Check Chest collision in Mission 2
      if (activeMission === 2 && missionState?.skyline?.length > 0 && !missionState.chestCollected) {
        if (hero.x >= 630 && hero.y >= 300) {
          if (onCollectChest) onCollectChest();
        }
      }

      // 1. Draw Dungeon Floor
      drawDungeonBackground(ctx, width, height);

      // 2. Draw Mission Specific Visuals
      drawMissionLayer(ctx, width, height, activeMission, missionState, executionSteps, currentStepIndex);

      // 3. Draw Squad Formation (Allies on tactical squad bench in arena)
      const squad = [
        { id: 1, type: 'mage', name: 'Mago' },
        { id: 2, type: 'knight', name: 'Cavaleiro' },
        { id: 3, type: 'barbarian', name: 'Bárbaro' },
        { id: 4, type: 'assassin', name: 'Assassino' },
      ];

      // Draw active hero at controllable position (hero.x, hero.y)
      const activeType = squad.find(s => s.id === activeMission)?.type || 'mage';
      drawCharacter(ctx, hero.x, hero.y, activeType, hero.direction, hero.frame, hero.isCasting, true);

      // Draw Squad Bench in bottom-left corner with party members
      ctx.save();
      ctx.fillStyle = 'rgba(15, 15, 30, 0.85)';
      ctx.fillRect(15, height - 68, 260, 56);
      ctx.strokeStyle = '#39395f';
      ctx.lineWidth = 2;
      ctx.strokeRect(15, height - 68, 260, 56);

      ctx.fillStyle = '#00d2d3';
      ctx.font = '7px "Press Start 2P"';
      ctx.fillText('TIME DE HERÓIS NA ARENA:', 22, height - 52);

      squad.forEach((member, idx) => {
        const mx = 40 + idx * 62;
        const my = height - 26;
        const isCurrent = member.id === activeMission;

        drawCharacter(ctx, mx, my, member.type, 'down', isCurrent ? hero.frame : 0, false, isCurrent);

        ctx.fillStyle = isCurrent ? '#f9ca24' : '#a4b0be';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText(member.name, mx - 16, height - 14);
      });
      ctx.restore();

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
      // Mission 2: Cavaleiro - Karatsuba Multiplication
      drawKaratsubaVisuals(ctx, width, height, state, currentStep);
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

  const drawKaratsubaVisuals = (ctx, width, height, state, currentStep) => {
    const x = state?.karatsubaX ?? 1234;
    const y = state?.karatsubaY ?? 5678;
    const product = state?.karatsubaProduct;
    const isCompleted = !!product;

    // Header
    ctx.save();
    ctx.fillStyle = '#f9ca24';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillText('⚔️ CANHÃO DE CERCO KARATSUBA // DANO DE MULTIPLICAÇÃO', 35, 35);

    if (currentStep?.message) {
      ctx.fillStyle = '#00d2d3';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`FASE D&C: ${currentStep.type}`, 35, 55);
    }

    // Target Fortress Gate
    ctx.font = '45px monospace';
    ctx.fillText('🏰', width - 110, 150);
    ctx.fillStyle = '#e94560';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillText('MURALHA DO BOSS', width - 145, 180);

    // Multiplicands Box
    const boxX = 35;
    const boxY = 80;
    ctx.fillStyle = '#14142b';
    ctx.strokeStyle = '#f9ca24';
    ctx.lineWidth = 2;
    ctx.fillRect(boxX, boxY, 260, 60);
    ctx.strokeRect(boxX, boxY, 260, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText(`X = ${x}`, boxX + 15, boxY + 26);
    ctx.fillText(`Y = ${y}`, boxX + 15, boxY + 48);

    // D&C 3-Term Formula Box
    const fX = 35;
    const fY = 160;
    ctx.fillStyle = '#0b0b1a';
    ctx.strokeStyle = '#39395f';
    ctx.lineWidth = 2;
    ctx.fillRect(fX, fY, 380, 105);
    ctx.strokeRect(fX, fY, 380, 105);

    ctx.fillStyle = '#00d2d3';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('REDUÇÃO DE GAUSS: 4 MULTIPLICAÇÕES -> 3', fX + 12, fY + 22);

    ctx.fillStyle = '#f5f6fa';
    ctx.font = '11px "VT323"';
    ctx.fillText(`Fatias: X = 10^m(A) + B  |  Y = 10^m(C) + D`, fX + 12, fY + 42);

    // Step calculations
    const dData = currentStep?.data;
    if (dData?.z0 !== undefined || dData?.highX !== undefined) {
      ctx.fillStyle = '#2ed573';
      ctx.fillText(`z0 (BD) = ${dData.z0 ?? 'calculando...'} | z2 (AC) = ${dData.z2 ?? 'calculando...'}`, fX + 12, fY + 65);
      ctx.fillText(`z1 = (A+B)(C+D) - z2 - z0 = ${dData.z1 ?? 'calculando...'}`, fX + 12, fY + 85);
    } else {
      ctx.fillStyle = '#a4b0be';
      ctx.fillText('1. z0 = B × D (Recursivo 1)', fX + 12, fY + 62);
      ctx.fillText('2. z2 = A × C (Recursivo 2)', fX + 12, fY + 78);
      ctx.fillText('3. z1 = (A+B)×(C+D) - z2 - z0 (Recursivo 3)', fX + 12, fY + 94);
    }

    // Impact Laser Cannon Blast when Completed
    if (isCompleted) {
      ctx.strokeStyle = '#f9ca24';
      ctx.lineWidth = 6;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(300, 120);
      ctx.lineTo(width - 110, 130);
      ctx.stroke();

      // Explosion spark
      ctx.fillStyle = '#ff4757';
      ctx.font = '12px "Press Start 2P"';
      ctx.fillText(`💥 DANO KARATSUBA: ${product}!`, 180, 300);

      ctx.fillStyle = '#2ed573';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText('ESCUDO DA MURALHA DESTRUÍDO!', 210, 320);
    }

    ctx.restore();
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
    const targetK = state?.targetK ?? 4;
    const targetFound = state?.targetFound;
    const startX = 36;
    const spacing = 72;

    ctx.save();
    ctx.fillStyle = '#2ed573';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillText(`🗡️ MEDIANA DAS MEDIANAS (BFPRT) // META: ${targetK}º ALVO`, startX, 35);

    if (currentStep?.message) {
      ctx.fillStyle = '#00d2d3';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`FASE BFPRT: ${currentStep.type}`, startX, 55);
    }
    ctx.restore();

    // Draw Groups of 5 dashed boundary boxes
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 210, 211, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    for (let g = 0; g < monsters.length; g += 5) {
      const gCount = Math.min(5, monsters.length - g);
      const gx = startX + g * spacing - 14;
      const gw = gCount * spacing - 8;
      ctx.strokeRect(gx, 120, gw, 130);

      ctx.fillStyle = 'rgba(0, 210, 211, 0.8)';
      ctx.font = '7px "Press Start 2P"';
      ctx.fillText(`GRUPO ${Math.floor(g / 5) + 1} (BLOCO DE 5)`, gx + 6, 112);
    }
    ctx.restore();

    monsters.forEach((m, i) => {
      const x = startX + i * spacing;
      const y = 145;
      const isTarget = targetFound && targetFound.id === m.id;
      const isEliminated = m.eliminated;
      const isPivot = currentStep?.data?.pivot?.id === m.id;
      const isLocalMedian = currentStep?.data?.medians?.some((med) => med.id === m.id);

      ctx.save();
      ctx.globalAlpha = isEliminated ? 0.25 : 1.0;

      // Platform
      ctx.fillStyle = isTarget ? '#241c12' : '#141424';
      ctx.strokeStyle = isPivot ? '#f9ca24' : (isLocalMedian ? '#2ed573' : '#39395f');
      ctx.lineWidth = isPivot || isTarget ? 3 : 1.5;
      ctx.fillRect(x - 10, y - 10, 60, 85);
      ctx.strokeRect(x - 10, y - 10, 60, 85);

      // Monster icon
      ctx.font = isTarget ? '32px monospace' : '26px monospace';
      ctx.fillText(isTarget ? '👑' : (isEliminated ? '💀' : '👾'), x + 6, y + 25);

      // Monster ID
      ctx.fillStyle = '#a4b0be';
      ctx.font = '9px "VT323"';
      ctx.fillText(`#${m.id}`, x - 4, y + 4);

      // Power badge
      ctx.fillStyle = isTarget ? '#2ed573' : (isPivot ? '#f9ca24' : '#00d2d3');
      ctx.fillRect(x - 4, y + 42, 48, 16);
      ctx.fillStyle = '#000000';
      ctx.font = '9px "Press Start 2P"';
      ctx.fillText(`P:${m.power}`, x - 1, y + 54);

      if (isPivot) {
        ctx.fillStyle = '#f9ca24';
        ctx.font = '7px "Press Start 2P"';
        ctx.fillText('PIVÔ MoM', x - 4, y + 72);
      } else if (isLocalMedian) {
        ctx.fillStyle = '#2ed573';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText('MEDIANA 5', x - 6, y + 72);
      }

      if (isEliminated) {
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 50, y + 75);
        ctx.stroke();
      }

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
      if (onHeroPositionChange) {
        onHeroPositionChange({ x: hero.x, y: hero.y });
      }
    }, 150);
  };

  // Canvas click handler: squad selection, spawn points or trigger action
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);

    // Clicked on Squad bench to select hero
    if (clickY >= 420 - 68 && clickX <= 275 && setActiveMission) {
      sound.playClick();
      const squadIdx = Math.floor((clickX - 15) / 65);
      const chosenId = Math.min(4, Math.max(1, squadIdx + 1));
      setActiveMission(chosenId);
      return;
    }

    if (activeMission === 1 && !isExecuting) {
      sound.playPowerup();
      const newId = (missionState.points?.length || 0) + 1;
      setMissionState((prev) => ({
        ...prev,
        points: [...(prev.points || []), { id: newId, x: clickX, y: clickY }],
        bestPair: null,
        minDist: null,
      }));
    } else {
      heroRef.current.isCasting = true;
      onTriggerAlgorithm();
      setTimeout(() => {
        heroRef.current.isCasting = false;
      }, 300);
    }
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
          onClick={handleCanvasClick}
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
