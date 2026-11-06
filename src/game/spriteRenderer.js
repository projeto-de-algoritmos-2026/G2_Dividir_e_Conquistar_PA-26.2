// Pixel Art Drawing Utilities for Canvas
// Draws crisp 16x16 and 24x24 retro characters without external image asset dependencies

export function drawPixelHero(ctx, x, y, direction = 'down', frame = 0, isCasting = false) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  const pixelSize = 2; // Each sprite pixel is 2x2 canvas pixels
  const walkBob = (frame % 2 === 1) ? -1 : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wizard / Knight Body
  const isFacingLeft = direction === 'left';
  if (isFacingLeft) {
    ctx.scale(-1, 1);
  }

  // Cape / Robe Back
  ctx.fillStyle = '#1e3799';
  ctx.fillRect(-7 * pixelSize, (-2 + walkBob) * pixelSize, 14 * pixelSize, 8 * pixelSize);

  // Robe Front / Tunic
  ctx.fillStyle = '#4a69bd';
  ctx.fillRect(-5 * pixelSize, (-3 + walkBob) * pixelSize, 10 * pixelSize, 7 * pixelSize);

  // Gold Belt
  ctx.fillStyle = '#f9ca24';
  ctx.fillRect(-5 * pixelSize, (3 + walkBob) * pixelSize, 10 * pixelSize, 2 * pixelSize);
  ctx.fillStyle = '#f6b93b';
  ctx.fillRect(-1 * pixelSize, (3 + walkBob) * pixelSize, 2 * pixelSize, 2 * pixelSize);

  // Feet / Boots
  ctx.fillStyle = '#2c3e50';
  if (direction === 'down' || direction === 'up') {
    const leftFootOffset = (frame === 1) ? -2 : 0;
    const rightFootOffset = (frame === 3) ? -2 : 0;
    ctx.fillRect(-4 * pixelSize, (5 + leftFootOffset) * pixelSize, 3 * pixelSize, 3 * pixelSize);
    ctx.fillRect(1 * pixelSize, (5 + rightFootOffset) * pixelSize, 3 * pixelSize, 3 * pixelSize);
  } else {
    const stepOffset = (frame % 2 === 1) ? 2 : -2;
    ctx.fillRect((-3 + stepOffset) * pixelSize, 5 * pixelSize, 3 * pixelSize, 3 * pixelSize);
    ctx.fillRect((1 - stepOffset) * pixelSize, 5 * pixelSize, 3 * pixelSize, 3 * pixelSize);
  }

  // Face / Head
  ctx.fillStyle = '#f8c291';
  ctx.fillRect(-4 * pixelSize, (-8 + walkBob) * pixelSize, 8 * pixelSize, 6 * pixelSize);

  // Eyes
  if (direction !== 'up') {
    ctx.fillStyle = '#1e272e';
    if (direction === 'down') {
      ctx.fillRect(-3 * pixelSize, (-6 + walkBob) * pixelSize, 2 * pixelSize, 2 * pixelSize);
      ctx.fillRect(1 * pixelSize, (-6 + walkBob) * pixelSize, 2 * pixelSize, 2 * pixelSize);
      // Eye reflection
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3 * pixelSize, (-6 + walkBob) * pixelSize, 1 * pixelSize, 1 * pixelSize);
      ctx.fillRect(1 * pixelSize, (-6 + walkBob) * pixelSize, 1 * pixelSize, 1 * pixelSize);
    } else {
      // Side view
      ctx.fillRect(1 * pixelSize, (-6 + walkBob) * pixelSize, 2 * pixelSize, 2 * pixelSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2 * pixelSize, (-6 + walkBob) * pixelSize, 1 * pixelSize, 1 * pixelSize);
    }
  }

  // Wizard Pointy Hat
  ctx.fillStyle = '#0c2461';
  // Brim
  ctx.fillRect(-7 * pixelSize, (-9 + walkBob) * pixelSize, 14 * pixelSize, 2 * pixelSize);
  // Cone
  ctx.fillRect(-5 * pixelSize, (-12 + walkBob) * pixelSize, 10 * pixelSize, 3 * pixelSize);
  ctx.fillRect(-3 * pixelSize, (-15 + walkBob) * pixelSize, 6 * pixelSize, 3 * pixelSize);
  ctx.fillRect(-1 * pixelSize, (-18 + walkBob) * pixelSize, 3 * pixelSize, 3 * pixelSize);

  // Hat Band (Gold)
  ctx.fillStyle = '#f9ca24';
  ctx.fillRect(-5 * pixelSize, (-10 + walkBob) * pixelSize, 10 * pixelSize, 1 * pixelSize);

  // Magic Staff / Sword
  const staffX = 6 * pixelSize;
  const staffY = (-8 + walkBob + (isCasting ? -4 : 0)) * pixelSize;
  
  // Staff wood
  ctx.fillStyle = '#784212';
  ctx.fillRect(staffX, staffY, 2 * pixelSize, 16 * pixelSize);
  
  // Staff Crystal Gem
  ctx.fillStyle = isCasting ? '#ffffff' : '#00d2d3';
  ctx.fillRect((staffX - 1 * pixelSize), (staffY - 3 * pixelSize), 4 * pixelSize, 4 * pixelSize);
  
  if (isCasting) {
    // Glow aura around staff
    ctx.strokeStyle = '#00d2d3';
    ctx.lineWidth = 2;
    ctx.strokeRect((staffX - 3 * pixelSize), (staffY - 5 * pixelSize), 8 * pixelSize, 8 * pixelSize);
  }

  ctx.restore();
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
      // Small pixel stone cracks randomly based on coordinates
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

