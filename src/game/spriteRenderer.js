// Pixel Art Drawing Utilities for Canvas
// Draws crisp 16x16 and 24x24 retro characters: Mage, Knight, Barbarian, and Assassin

export function drawCharacter(ctx, x, y, characterType = 'mage', direction = 'down', frame = 0, isCasting = false, isSelected = false) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  const pixelSize = 2;
  const walkBob = (frame % 2 === 1) ? -1 : 0;

  // Selected hero glow ring
  if (isSelected) {
    ctx.save();
    ctx.strokeStyle = '#00d2d3';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.ellipse(0, 14, 16, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Floating selection arrow
    ctx.fillStyle = '#00d2d3';
    ctx.beginPath();
    ctx.moveTo(0, -28 + walkBob);
    ctx.lineTo(-4, -34 + walkBob);
    ctx.lineTo(4, -34 + walkBob);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const isFacingLeft = direction === 'left';
  if (isFacingLeft) {
    ctx.scale(-1, 1);
  }

  switch (characterType) {
    case 'knight':
      drawKnight(ctx, pixelSize, walkBob, direction, frame, isCasting);
      break;
    case 'barbarian':
      drawBarbarian(ctx, pixelSize, walkBob, direction, frame, isCasting);
      break;
    case 'assassin':
      drawAssassin(ctx, pixelSize, walkBob, direction, frame, isCasting);
      break;
    case 'mage':
    default:
      drawMage(ctx, pixelSize, walkBob, direction, frame, isCasting);
      break;
  }

  ctx.restore();
}

// 🧙 MAGE
function drawMage(ctx, p, bob, dir, frame, casting) {
  // Robe Blue
  ctx.fillStyle = '#1e3799';
  ctx.fillRect(-6 * p, (-3 + bob) * p, 12 * p, 8 * p);

  // Gold Belt
  ctx.fillStyle = '#f9ca24';
  ctx.fillRect(-5 * p, (2 + bob) * p, 10 * p, 2 * p);

  // Boots
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(-4 * p, 5 * p, 3 * p, 3 * p);
  ctx.fillRect(1 * p, 5 * p, 3 * p, 3 * p);

  // Face
  ctx.fillStyle = '#f8c291';
  ctx.fillRect(-4 * p, (-8 + bob) * p, 8 * p, 5 * p);

  // Eyes
  if (dir !== 'up') {
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(-3 * p, (-6 + bob) * p, 2 * p, 2 * p);
    ctx.fillRect(1 * p, (-6 + bob) * p, 2 * p, 2 * p);
  }

  // Pointy Wizard Hat (Navy blue)
  ctx.fillStyle = '#0c2461';
  ctx.fillRect(-7 * p, (-9 + bob) * p, 14 * p, 2 * p); // brim
  ctx.fillRect(-5 * p, (-12 + bob) * p, 10 * p, 3 * p);
  ctx.fillRect(-3 * p, (-15 + bob) * p, 6 * p, 3 * p);
  ctx.fillRect(-1 * p, (-18 + bob) * p, 3 * p, 3 * p);

  // Hat Band
  ctx.fillStyle = '#f9ca24';
  ctx.fillRect(-5 * p, (-10 + bob) * p, 10 * p, 1 * p);

  // Magic Staff
  const staffX = 6 * p;
  const staffY = (-8 + bob + (casting ? -4 : 0)) * p;
  ctx.fillStyle = '#784212';
  ctx.fillRect(staffX, staffY, 2 * p, 16 * p);
  ctx.fillStyle = casting ? '#ffffff' : '#00d2d3';
  ctx.fillRect(staffX - 1 * p, staffY - 3 * p, 4 * p, 4 * p);

  if (casting) {
    ctx.strokeStyle = '#00d2d3';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(staffX - 3 * p, staffY - 5 * p, 8 * p, 8 * p);
  }
}

// ⚔️ KNIGHT
function drawKnight(ctx, p, bob, dir, frame, casting) {
  // Silver Plate Armor
  ctx.fillStyle = '#718093';
  ctx.fillRect(-6 * p, (-3 + bob) * p, 12 * p, 8 * p);

  // Red Cape
  ctx.fillStyle = '#e84118';
  ctx.fillRect(-7 * p, (-2 + bob) * p, 2 * p, 9 * p);

  // Armor highlights
  ctx.fillStyle = '#dcdde1';
  ctx.fillRect(-4 * p, (-2 + bob) * p, 8 * p, 3 * p);

  // Gold Belt
  ctx.fillStyle = '#fbc531';
  ctx.fillRect(-5 * p, (2 + bob) * p, 10 * p, 2 * p);

  // Greaves / Boots
  ctx.fillStyle = '#2f3640';
  ctx.fillRect(-4 * p, 5 * p, 3 * p, 3 * p);
  ctx.fillRect(1 * p, 5 * p, 3 * p, 3 * p);

  // Full Helmet
  ctx.fillStyle = '#718093';
  ctx.fillRect(-5 * p, (-9 + bob) * p, 10 * p, 7 * p);

  // Visor Slit
  ctx.fillStyle = '#192a56';
  ctx.fillRect(-4 * p, (-6 + bob) * p, 8 * p, 2 * p);

  // Red Helmet Plume / Feather
  ctx.fillStyle = '#c23616';
  ctx.fillRect(-1 * p, (-13 + bob) * p, 3 * p, 4 * p);
  ctx.fillRect(1 * p, (-11 + bob) * p, 2 * p, 3 * p);

  // Broadsword & Shield
  const swordX = 6 * p;
  const swordY = (-10 + bob + (casting ? -6 : 0)) * p;
  // Blade
  ctx.fillStyle = '#f5f6fa';
  ctx.fillRect(swordX, swordY, 2 * p, 16 * p);
  // Crossguard & Hilt
  ctx.fillStyle = '#fbc531';
  ctx.fillRect(swordX - 2 * p, swordY + 11 * p, 6 * p, 2 * p);
  ctx.fillStyle = '#44bd32';
  ctx.fillRect(swordX, swordY + 13 * p, 2 * p, 3 * p);
}

// 🪓 BARBARIAN
function drawBarbarian(ctx, p, bob, dir, frame, casting) {
  // Muscular Bare Chest / Leather Harness
  ctx.fillStyle = '#e1b12c';
  ctx.fillRect(-6 * p, (-3 + bob) * p, 12 * p, 7 * p);

  // Leather Harness Strap
  ctx.fillStyle = '#44220b';
  ctx.fillRect(-5 * p, (-2 + bob) * p, 10 * p, 2 * p);

  // Fur Kilt / Loincloth
  ctx.fillStyle = '#833917';
  ctx.fillRect(-5 * p, (2 + bob) * p, 10 * p, 3 * p);

  // Heavy Fur Boots
  ctx.fillStyle = '#4b2413';
  ctx.fillRect(-4 * p, 5 * p, 3 * p, 3 * p);
  ctx.fillRect(1 * p, 5 * p, 3 * p, 3 * p);

  // Head & Beard
  ctx.fillStyle = '#e1b12c';
  ctx.fillRect(-4 * p, (-8 + bob) * p, 8 * p, 5 * p);

  // Red/Orange Viking Beard
  ctx.fillStyle = '#d35400';
  ctx.fillRect(-4 * p, (-5 + bob) * p, 8 * p, 4 * p);

  // Horned Barbarian Helmet
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(-5 * p, (-10 + bob) * p, 10 * p, 3 * p);
  // White Horns
  ctx.fillStyle = '#f5f6fa';
  ctx.fillRect(-7 * p, (-12 + bob) * p, 2 * p, 3 * p);
  ctx.fillRect(5 * p, (-12 + bob) * p, 2 * p, 3 * p);

  // Double-Headed War Axe
  const axeX = 7 * p;
  const axeY = (-12 + bob + (casting ? -5 : 0)) * p;
  // Shaft
  ctx.fillStyle = '#784212';
  ctx.fillRect(axeX, axeY, 2 * p, 18 * p);
  // Axe Blades
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(axeX - 4 * p, axeY + 2 * p, 4 * p, 5 * p);
  ctx.fillRect(axeX + 2 * p, axeY + 2 * p, 4 * p, 5 * p);
  ctx.fillStyle = '#7f8c8d';
  ctx.fillRect(axeX - 3 * p, axeY + 3 * p, 2 * p, 3 * p);
}

// 🗡️ ASSASSIN
function drawAssassin(ctx, p, bob, dir, frame, casting) {
  // Dark Stealth Cloak
  ctx.fillStyle = '#1e272e';
  ctx.fillRect(-6 * p, (-3 + bob) * p, 12 * p, 8 * p);

  // Purple Tunic Trim
  ctx.fillStyle = '#8c7ae6';
  ctx.fillRect(-4 * p, (-2 + bob) * p, 8 * p, 3 * p);

  // Dagger Belt with Pouches
  ctx.fillStyle = '#485460';
  ctx.fillRect(-5 * p, (2 + bob) * p, 10 * p, 2 * p);

  // Silent Leather Boots
  ctx.fillStyle = '#0f1418';
  ctx.fillRect(-4 * p, 5 * p, 3 * p, 3 * p);
  ctx.fillRect(1 * p, 5 * p, 3 * p, 3 * p);

  // Dark Hood
  ctx.fillStyle = '#1e272e';
  ctx.fillRect(-5 * p, (-10 + bob) * p, 10 * p, 7 * p);

  // Glowing Assassin Mask / Eyes
  ctx.fillStyle = '#2ed573';
  ctx.fillRect(-3 * p, (-6 + bob) * p, 2 * p, 1 * p);
  ctx.fillRect(1 * p, (-6 + bob) * p, 2 * p, 1 * p);

  // Dual Daggers
  const dagX1 = 6 * p;
  const dagY1 = (-4 + bob + (casting ? -6 : 0)) * p;
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(dagX1, dagY1, 2 * p, 8 * p);
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(dagX1 - 1 * p, dagY1 + 7 * p, 4 * p, 2 * p);

  // Second Dagger Left Hand
  const dagX2 = -7 * p;
  const dagY2 = (-2 + bob) * p;
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(dagX2, dagY2, 2 * p, 7 * p);
}

// Backward compatibility export
export function drawPixelHero(ctx, x, y, direction = 'down', frame = 0, isCasting = false) {
  drawCharacter(ctx, x, y, 'mage', direction, frame, isCasting, true);
}

// Draw Dungeon Floor Tile Pattern
export function drawDungeonBackground(ctx, width, height) {
  // Base dark floor
  ctx.fillStyle = '#10101e';
  ctx.fillRect(0, 0, width, height);

  // Grid tiles
  const tileSize = 32;
  ctx.strokeStyle = '#18182d';
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += tileSize) {
    for (let y = 0; y < height; y += tileSize) {
      ctx.strokeRect(x, y, tileSize, tileSize);
      if ((x * 13 + y * 7) % 7 === 0) {
        ctx.fillStyle = '#22223d';
        ctx.fillRect(x + 4, y + 8, 3, 2);
        ctx.fillRect(x + 7, y + 10, 2, 4);
      }
    }
  }

  // Dungeon Borders
  ctx.strokeStyle = '#3d3d6b';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, width - 6, height - 6);
  
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, width - 12, height - 12);
}
