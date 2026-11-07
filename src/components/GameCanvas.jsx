import React, { useRef, useEffect } from 'react';
import { drawCharacter, drawDungeonBackground } from '../game/spriteRenderer';
import { sound } from '../audio/soundEffects';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';

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
      // Avoid interfering when typing inside custom input fields
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

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
        const length = Math.sqrt(dx * dx + dy * dy);
        hero.x += (dx / length) * hero.speed;
        hero.y += (dy / length) * hero.speed;

        if (Math.abs(dx) > Math.abs(dy)) {
          hero.direction = dx > 0 ? 'right' : 'left';
        } else {
          hero.direction = dy > 0 ? 'down' : 'up';
        }

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
      const activeType = squad.find((s) => s.id === activeMission)?.type || 'mage';
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
      drawCanvasOverlay(ctx, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeMission, missionState, executionSteps, currentStepIndex, onHeroPositionChange]);

  // Helper to draw mission specifics
  const drawMissionLayer = (ctx, width, height, missionId, state, steps, stepIdx) => {
    const currentStep = steps && stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

    if (missionId === 1) {
      drawClosestPairVisuals(ctx, width, height, state, currentStep);
    } else if (missionId === 2) {
      drawKaratsubaVisuals(ctx, width, height, state, currentStep);
    } else if (missionId === 3) {
      drawInversionVisuals(ctx, width, height, state, currentStep);
    } else if (missionId === 4) {
      drawQuickSelectVisuals(ctx, width, height, state, currentStep);
    }
  };

  const drawClosestPairVisuals = (ctx, width, height, state, currentStep) => {
    const points = state?.points || [];
    const bestPair = state?.bestPair;
    const stepPair = currentStep?.data?.currentPair;
    const activeSubset = currentStep?.data?.subset;

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

      ctx.fillStyle = '#00d2d3';
      ctx.font = '9px "Press Start 2P"';
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

    // Draw active step comparison ray (Step-by-step visualization)
    if (stepPair && stepPair[0] && stepPair[1] && !bestPair) {
      ctx.save();
      ctx.strokeStyle = '#f9ca24';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(stepPair[0].x, stepPair[0].y);
      ctx.lineTo(stepPair[1].x, stepPair[1].y);
      ctx.stroke();

      const mx = (stepPair[0].x + stepPair[1].x) / 2;
      const my = (stepPair[0].y + stepPair[1].y) / 2;
      ctx.fillStyle = '#f9ca24';
      ctx.font = '8px "Press Start 2P"';
      const distVal = currentStep?.data?.currentDist ?? currentStep?.data?.dist;
      if (distVal !== undefined) {
        ctx.fillText(`${distVal.toFixed(1)}px`, mx + 6, my - 6);
      }
      ctx.restore();
    }

    // Draw points (Projectiles / Magic Orbs)
    points.forEach((p, idx) => {
      ctx.save();
      const isSelected = bestPair && (p.id === bestPair[0]?.id || p.id === bestPair[1]?.id);
      const isBeingTested = stepPair && (p.id === stepPair[0]?.id || p.id === stepPair[1]?.id);
      const isInSubset = activeSubset?.some((sp) => sp.id === p.id);

      // Outer ring for active recursion subset
      if (isInSubset || isBeingTested) {
        ctx.strokeStyle = isBeingTested ? '#f9ca24' : '#00d2d3';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Pulse ring for points
      ctx.fillStyle = isSelected ? '#ff4757' : isBeingTested ? '#f9ca24' : '#2ed573';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isSelected ? 8 : isBeingTested ? 6.5 : 5, 0, Math.PI * 2);
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
    const dData = currentStep?.data;
    const activeBranch = dData?.branch || '';

    ctx.save();
    ctx.fillStyle = '#f9ca24';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillText('⚔️ CANHÃO DE CERCO KARATSUBA // ÁRVORE DE RECURSÃO', 30, 32);

    if (currentStep?.message) {
      ctx.fillStyle = '#00d2d3';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(
        `FASE: ${currentStep.type} ${dData?.depth !== undefined ? `(NÍVEL ${dData.depth})` : ''}`,
        30,
        50
      );
    }

    // Target Fortress Gate on the right
    ctx.font = '44px monospace';
    ctx.fillText('🏰', width - 105, 145);
    ctx.fillStyle = '#e94560';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('MURALHA DO BOSS', width - 145, 175);

    // Visual Recursion Tree of Karatsuba (Root -> 3 Recursive Branches z2, z1, z0)
    const rootX = 240;
    const rootY = 66;
    const rootW = 210;
    const rootH = 44;

    const childY = 148;
    const childW = 148;
    const childH = 54;
    const children = [
      {
        key: 'z2',
        cx: 95,
        title: 'z2 = A × C',
        sub: dData?.z2 !== undefined ? `= ${dData.z2}` : 'Ramo Alto (10^2m)',
        color: '#00d2d3',
        active: activeBranch.includes('z2'),
      },
      {
        key: 'z1',
        cx: 260,
        title: 'z1 = (A+B)(C+D)',
        sub: dData?.z1 !== undefined ? `Gauss = ${dData.z1}` : '- z2 - z0 (10^m)',
        color: '#f9ca24',
        active: activeBranch.includes('z1'),
      },
      {
        key: 'z0',
        cx: 425,
        title: 'z0 = B × D',
        sub: dData?.z0 !== undefined ? `= ${dData.z0}` : 'Ramo Baixo (10^0)',
        color: '#2ed573',
        active: activeBranch.includes('z0'),
      },
    ];

    // Draw tree connector lines from Root to 3 children
    children.forEach((ch) => {
      ctx.save();
      ctx.strokeStyle = ch.active ? ch.color : '#39395f';
      ctx.lineWidth = ch.active ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(rootX, rootY + rootH);
      ctx.lineTo(ch.cx, childY);
      ctx.stroke();
      ctx.restore();
    });

    // Draw Root Node (X × Y)
    ctx.fillStyle = '#14142b';
    ctx.strokeStyle = '#f9ca24';
    ctx.lineWidth = 2;
    ctx.fillRect(rootX - rootW / 2, rootY, rootW, rootH);
    ctx.strokeRect(rootX - rootW / 2, rootY, rootW, rootH);

    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillText(`RAIZ: ${x} × ${y}`, rootX - rootW / 2 + 12, rootY + 18);
    ctx.fillStyle = '#00d2d3';
    ctx.font = '12px "VT323"';
    const splitInfo =
      dData?.highX !== undefined
        ? `A=${dData.highX}, B=${dData.lowX} | C=${dData.highY}, D=${dData.lowY}`
        : `Divide em 2 metades -> 3 chamadas recursivas`;
    ctx.fillText(splitInfo, rootX - rootW / 2 + 12, rootY + 35);

    // Draw the 3 Child Nodes
    children.forEach((ch) => {
      const bx = ch.cx - childW / 2;
      ctx.fillStyle = ch.active ? '#1d1d3b' : '#0b0b1a';
      ctx.strokeStyle = ch.active ? ch.color : '#39395f';
      ctx.lineWidth = ch.active ? 3 : 1.5;
      ctx.fillRect(bx, childY, childW, childH);
      ctx.strokeRect(bx, childY, childW, childH);

      ctx.fillStyle = ch.color;
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(ch.title, bx + 8, childY + 20);

      ctx.fillStyle = '#ecf0f1';
      ctx.font = '13px "VT323"';
      ctx.fillText(ch.sub, bx + 8, childY + 40);
    });

    // Combine / Brute Force status box below the tree
    const infoY = 220;
    ctx.fillStyle = '#0b0b18';
    ctx.strokeStyle = dData?.isBruteForce ? '#ff4757' : '#39395f';
    ctx.lineWidth = 1.5;
    ctx.fillRect(25, infoY, 475, 44);
    ctx.strokeRect(25, infoY, 475, 44);

    if (dData?.isBruteForce && dData?.dX !== undefined) {
      ctx.fillStyle = '#ff4757';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(
        `FORÇA BRUTA O(n²): Dígito ${dData.dX} × Dígito ${dData.dY} = ${dData.elemProd} (Op #${dData.operationsCount})`,
        35,
        infoY + 26
      );
    } else {
      ctx.fillStyle = '#2ed573';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(
        `COMBINAR: XY = z2·10^(2m) + z1·10^m + z0  |  Operações base: ${dData?.operationsCount ?? 0}`,
        35,
        infoY + 26
      );
    }

    // Impact Laser Cannon Blast when Completed
    if (isCompleted) {
      ctx.strokeStyle = '#f9ca24';
      ctx.lineWidth = 6;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(345, 90);
      ctx.lineTo(width - 110, 130);
      ctx.stroke();

      ctx.fillStyle = '#ff4757';
      ctx.font = '11px "Press Start 2P"';
      ctx.fillText(`💥 DANO TOTAL: ${product}!`, 190, 298);

      ctx.fillStyle = '#2ed573';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText('MURALHA DO BOSS DESTRUÍDA!', 220, 318);
    }

    ctx.restore();
  };

  const drawInversionVisuals = (ctx, width, height, state, currentStep) => {
    const array = state?.array || [];
    const inversions = state?.inversions ?? 0;
    const n = array.length || 1;
    const startX = 35;
    const cardW = Math.min(54, Math.floor((width - 90) / n) - 8);
    const gap = Math.min(10, Math.max(4, Math.floor((width - 90 - cardW * n) / Math.max(1, n - 1))));
    const cardH = 66;
    const baseY = 185;

    // Draw Chaos Boss in background
    ctx.save();
    const isBossHit = currentStep?.type === 'INVERSION_FOUND';
    ctx.font = isBossHit ? '46px monospace' : '40px monospace';
    ctx.fillText('👹', width / 2 - 25, 80);

    ctx.fillStyle = isBossHit ? '#ff4757' : '#e94560';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`BOSS DE CAOS // INVERSÕES: ${inversions}`, width / 2 - 135, 108);

    if (isBossHit) {
      ctx.fillStyle = '#f9ca24';
      ctx.font = '10px "Press Start 2P"';
      ctx.fillText(
        `-CRÍTICO! +${currentStep.data?.countAdded || 1} INVERSÃO(ÕES)`,
        width / 2 - 125,
        42
      );
    }
    ctx.restore();

    // Draw Active Recursion status
    if (currentStep?.message) {
      ctx.save();
      ctx.fillStyle = '#00d2d3';
      ctx.font = '8px "Press Start 2P"';
      const depthTxt =
        currentStep.data?.depth !== undefined ? ` (NÍVEL ${currentStep.data.depth})` : '';
      ctx.fillText(`RECURSÃO: ${currentStep.type}${depthTxt}`, startX, baseY - 28);
      ctx.restore();
    }

    // Draw Curved Arc connecting inverted runes
    const leftVal = currentStep?.data?.leftItem;
    const rightVal = currentStep?.data?.rightItem;
    if (leftVal !== undefined && rightVal !== undefined) {
      const idxL = array.indexOf(leftVal);
      const idxR = array.lastIndexOf(rightVal);
      if (idxL !== -1 && idxR !== -1 && idxL !== idxR) {
        const x1 = startX + idxL * (cardW + gap) + cardW / 2;
        const x2 = startX + idxR * (cardW + gap) + cardW / 2;
        const midX = (x1 + x2) / 2;
        ctx.save();
        ctx.strokeStyle = isBossHit ? '#ff4757' : '#f9ca24';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(x1, baseY);
        ctx.quadraticCurveTo(midX, baseY - 48, x2, baseY);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw Rune cards
    array.forEach((val, i) => {
      const cx = startX + i * (cardW + gap);
      ctx.save();

      const isMergedHighlight = currentStep?.data?.merged?.includes(val);
      const isLeftSub = currentStep?.data?.left?.includes(val);
      const isRightSub = currentStep?.data?.right?.includes(val);
      const isComparing = val === leftVal || val === rightVal;

      ctx.fillStyle = isComparing
        ? '#3b1522'
        : isMergedHighlight
        ? '#1a2a3a'
        : '#1e272e';
      ctx.strokeStyle = isComparing
        ? '#ff4757'
        : isMergedHighlight
        ? '#00d2d3'
        : isLeftSub
        ? '#f9ca24'
        : isRightSub
        ? '#2ed573'
        : '#f9ca24';
      ctx.lineWidth = isComparing || isMergedHighlight ? 3.5 : 2;
      ctx.fillRect(cx, baseY, cardW, cardH);
      ctx.strokeRect(cx, baseY, cardW, cardH);

      // Card value
      ctx.fillStyle = '#ffffff';
      ctx.font = `${cardW < 45 ? 12 : 15}px "Press Start 2P"`;
      ctx.fillText(String(val), cx + Math.max(6, cardW / 2 - 10), baseY + 40);

      // Index label
      ctx.fillStyle = '#a4b0be';
      ctx.font = '10px "VT323"';
      ctx.fillText(`#${i}`, cx + cardW / 2 - 6, baseY + cardH + 14);
      ctx.restore();
    });
  };

  const drawQuickSelectVisuals = (ctx, width, height, state, currentStep) => {
    // Use step snapshot of monsters if available during playback so swaps/eliminations animate live
    const monsters = currentStep?.data?.monsters || state?.monsters || [];
    const targetK = state?.targetK ?? 4;
    const targetFound = state?.targetFound;
    const count = monsters.length || 1;
    const startX = 28;
    const spacing = count > 7 ? Math.floor((width - 50) / count) : 72;
    const boxW = Math.min(58, spacing - 8);

    ctx.save();
    ctx.fillStyle = '#2ed573';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillText(`🗡️ MEDIANA DAS MEDIANAS (BFPRT) // META: ${targetK}º ALVO`, startX, 32);

    if (currentStep?.message) {
      ctx.fillStyle = '#00d2d3';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`FASE BFPRT: ${currentStep.type}`, startX, 50);
    }
    ctx.restore();

    // Draw Active Search Window Bracket [left .. right]
    const rangeL = currentStep?.data?.left;
    const rangeR = currentStep?.data?.right;
    if (rangeL !== undefined && rangeR !== undefined && rangeR >= rangeL) {
      const bx = startX + rangeL * spacing - 10;
      const bw = (rangeR - rangeL + 1) * spacing - (spacing - boxW) + 8;
      ctx.save();
      ctx.fillStyle = 'rgba(46, 213, 115, 0.08)';
      ctx.fillRect(bx, 115, bw, 132);
      ctx.strokeStyle = '#2ed573';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, 115, bw, 132);
      ctx.fillStyle = '#2ed573';
      ctx.font = '7px "Press Start 2P"';
      ctx.fillText(`JANELA ATIVA [${rangeL + 1}..${rangeR + 1}]`, bx + 4, 260);
      ctx.restore();
    }

    // Draw Groups of 5 dashed boundary boxes
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 210, 211, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    for (let g = 0; g < monsters.length; g += 5) {
      const gCount = Math.min(5, monsters.length - g);
      const gx = startX + g * spacing - 8;
      const gw = gCount * spacing - (spacing - boxW) + 4;
      ctx.strokeRect(gx, 120, gw, 122);

      ctx.fillStyle = 'rgba(0, 210, 211, 0.85)';
      ctx.font = '7px "Press Start 2P"';
      ctx.fillText(`BLOCO ${Math.floor(g / 5) + 1} (5)`, gx + 4, 112);
    }
    ctx.restore();

    monsters.forEach((m, i) => {
      const x = startX + i * spacing;
      const y = 142;
      const isTarget =
        (targetFound && targetFound.id === m.id) ||
        currentStep?.data?.target?.id === m.id;
      const isEliminated = m.eliminated;
      const isPivot = currentStep?.data?.pivot?.id === m.id;
      const isLocalMedian = currentStep?.data?.medians?.some((med) => med.id === m.id);
      const isComparing = currentStep?.data?.comparing?.some((c) => c.id === m.id);

      ctx.save();
      ctx.globalAlpha = isEliminated ? 0.25 : 1.0;

      // Platform
      ctx.fillStyle = isTarget ? '#241c12' : isComparing ? '#2b1420' : '#141424';
      ctx.strokeStyle = isPivot
        ? '#f9ca24'
        : isLocalMedian
        ? '#2ed573'
        : isComparing
        ? '#ff4757'
        : '#39395f';
      ctx.lineWidth = isPivot || isTarget || isComparing ? 3 : 1.5;
      ctx.fillRect(x - 6, y - 10, boxW, 85);
      ctx.strokeRect(x - 6, y - 10, boxW, 85);

      // Monster icon
      ctx.font = isTarget ? '28px monospace' : '22px monospace';
      ctx.fillText(isTarget ? '👑' : isEliminated ? '💀' : '👾', x + boxW / 2 - 16, y + 24);

      // Monster ID
      ctx.fillStyle = '#a4b0be';
      ctx.font = '9px "VT323"';
      ctx.fillText(`#${m.id}`, x - 2, y + 3);

      // Power badge
      ctx.fillStyle = isTarget ? '#2ed573' : isPivot ? '#f9ca24' : '#00d2d3';
      ctx.fillRect(x - 2, y + 40, boxW - 8, 16);
      ctx.fillStyle = '#000000';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`P:${m.power}`, x, y + 52);

      if (isPivot) {
        ctx.fillStyle = '#f9ca24';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText('🎯 PIVÔ', x - 2, y + 69);
      } else if (isLocalMedian) {
        ctx.fillStyle = '#2ed573';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText('MED 5', x, y + 69);
      }

      if (isEliminated) {
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 10);
        ctx.lineTo(x + boxW - 6, y + 75);
        ctx.stroke();
      }

      ctx.restore();
    });
  };

  const drawCanvasOverlay = (ctx, width) => {
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
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
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
