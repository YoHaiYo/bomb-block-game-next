export function drawExplosionEffect(ctx, cell, cx, cy, cellSize, particles) {
  if (cell.explodeTimer > 0) {
    // 🔸 셀 기본 폭발 배경
    const phase = cell.flashPhase;
    const color = phase % 2 === 0 ? "yellow" : "orange";
    ctx.fillStyle = color;
    ctx.fillRect(cx, cy, cellSize, cellSize);

    // 🔸 파티클 최초 생성 (한 번만)
    if (cell.explodeTimer === 15) {
      const count = 12;
      const centerX = cx + cellSize / 2;
      const centerY = cy + cellSize / 2;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        const size = Math.random() * 3 + 2;

        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          color: Math.random() < 0.5 ? "orange" : "yellow",
          life: 20,
        });
      }
    }

    // 🔸 타이머 및 애니메이션 업데이트
    cell.explodeTimer--;
    if (cell.explodeTimer % 5 === 0) {
      cell.flashPhase++;
    }
    if (cell.explodeTimer <= 0) {
      cell.explosionDirection = null;
    }
  }
}
export function drawParticles(ctx, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;

    ctx.globalAlpha = p.life / 20;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function drawBomb(ctx, cell, cx, cy, size, damage) {
  const cxCenter = cx + size / 2;
  const cyCenter = cy + size / 2;
  const radius = size * 0.35;

  // 본체
  ctx.beginPath();
  ctx.arc(cxCenter, cyCenter, radius, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(
    cxCenter - 5,
    cyCenter - 5,
    radius * 0.2,
    cxCenter,
    cyCenter,
    radius
  );
  grad.addColorStop(0, "#444");
  grad.addColorStop(1, "#000");
  ctx.fillStyle = grad;
  ctx.fill();

  // 심지
  ctx.strokeStyle = "#cfa77b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cxCenter, cyCenter - radius);
  ctx.lineTo(cxCenter - 5, cyCenter - radius - 10);
  ctx.stroke();

  // 심지 위 불꽃
  const fireSize = (4 - cell.bomb.countdown) * 2 + 3;
  const fireColor = cell.bomb.countdown === 1 ? "red" : "orange";
  ctx.fillStyle = fireColor;
  ctx.beginPath();
  ctx.ellipse(
    cxCenter - 5,
    cyCenter - radius - 12,
    fireSize,
    fireSize * 0.8,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 데미지 숫자
  ctx.fillStyle = "white";
  ctx.font = `${size * 0.4}px sans-serif`;
  ctx.fillText(damage, cxCenter, cyCenter);
}
