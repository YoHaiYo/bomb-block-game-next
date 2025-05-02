export function drawExplosionEffect(ctx, cell, cx, cy, size) {
  const fireColors = ["#ffcc00", "#ff6600", "#ff3300"];
  ctx.fillStyle = fireColors[cell.flashPhase % fireColors.length];
  ctx.fillRect(cx, cy, size, size);

  cell.explodeTimer--;
  if (cell.explodeTimer % 5 === 0) {
    cell.flashPhase++;
  }
  if (cell.explodeTimer <= 0) {
    cell.explosionDirection = null;
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
