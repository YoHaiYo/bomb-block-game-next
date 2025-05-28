export function drawExplosionEffect(ctx, cell, cx, cy, cellSize, particles) {
  if (cell.explodeTimer > 0) {
    const centerX = cx + cellSize / 2;
    const centerY = cy + cellSize / 2;
    const radius = cellSize * 0.6;

    // 🔥 방사형 화염 효과 (radial gradient)
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );

    gradient.addColorStop(0, "#fffde7"); // 중심 - 거의 흰색
    gradient.addColorStop(0.2, "#fff176"); // 노랑
    gradient.addColorStop(0.5, "#ff9800"); // 주황
    gradient.addColorStop(1, "#f44336"); // 빨강

    ctx.fillStyle = gradient;
    ctx.fillRect(cx, cy, cellSize, cellSize);

    // 🎆 파티클 최초 생성
    if (cell.explodeTimer === 15) {
      const count = 12;
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

    // ⏳ 폭발 이펙트 타이머 관리
    cell.explodeTimer--;
    if (cell.explodeTimer % 5 === 0) {
      cell.flashPhase++;
    }
    if (cell.explodeTimer <= 0) {
      cell.explosionDirection = null;
    }
  }
}
// 🔹 파티클 폭발 효과 생성 (시각 효과용)
export const createExplosionParticles = (x, y, cellSize, particles) => {
  const count = 12;
  const cx = x * cellSize.current + cellSize.current / 2;
  const cy = y * cellSize.current + cellSize.current / 2;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    const size = Math.random() * 3 + 2;
    particles.current.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      color: Math.random() < 0.5 ? "orange" : "yellow",
      life: 20,
    });
  }
};

// 폭파 파티클 퍼지는거
export function drawParticles(ctx, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // 속도 조정 (더 넓게 튀게)
    p.x += p.vx * 1.3; // 속도 약간 증가
    p.y += p.vy * 1.3;
    p.life -= 1;

    // 스파크처럼 랜덤하게 크기 미세 진동
    const flicker = Math.random() * 0.5;

    // 색상 점점 밝게 → 어둡게 변화
    const fadeRatio = p.life / 20;
    const baseColor = p.color === "orange" ? [255, 165, 0] : [255, 255, 0]; // RGB

    const r = Math.min(255, baseColor[0] + 50 * (1 - fadeRatio));
    const g = Math.min(255, baseColor[1] + 50 * (1 - fadeRatio));
    const b = baseColor[2] * fadeRatio;

    ctx.globalAlpha = fadeRatio;
    ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size + flicker, 0, Math.PI * 2);
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
  const sparkX = cxCenter - 5;
  const sparkY = cyCenter - radius - 12;

  // 스파크 파티클 생성 (countdown === 1 에서만 생성 추천)
  if (cell.bomb.countdown === 1) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const length = Math.random() * 6 + 4;
      const ex = sparkX + Math.cos(angle) * length;
      const ey = sparkY + Math.sin(angle) * length;

      // 선으로 표현
      ctx.strokeStyle = i % 2 === 0 ? "yellow" : "orange";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sparkX, sparkY);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // 중앙 강한 불빛
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 데미지 숫자
  ctx.fillStyle = "yellow";
  ctx.font = `${size * 0.4}px sans-serif`;
  ctx.fillText(damage, cxCenter, cyCenter);
}

const tankImage = new Image();
tankImage.src = "/img/tank.png"; // public/img/tank.png 위치에 이미지 저장
export function drawWallBlock(
  ctx,
  cx,
  cy,
  size,
  strength,
  color,
  isTank = false
) {
  // 배경 색상
  ctx.fillStyle = color;
  ctx.fillRect(cx, cy, size, size);

  // 비정형 격자 구성
  const rowCounts = [3, 4, 3];
  const colCounts = [3, 5, 4];
  const rows = rowCounts[(cx + cy) % rowCounts.length]; // 위치 기반 선택
  const cols = colCounts[(cx + cy) % colCounts.length];
  const rowHeight = size / rows;
  const colWidth = size / cols;

  ctx.strokeStyle = "rgba(30,30,30,0.3)";
  ctx.lineWidth = 1;

  // 줄마다 약간 오프셋을 줌
  for (let y = 0; y <= rows; y++) {
    const offsetY = cy + y * rowHeight + (y % 2 === 0 ? 0 : 0.5);
    ctx.beginPath();
    ctx.moveTo(cx, offsetY);
    ctx.lineTo(cx + size, offsetY);
    ctx.stroke();
  }

  for (let x = 0; x <= cols; x++) {
    const offsetX = cx + x * colWidth + (x % 2 === 0 ? 0 : 0.5);
    ctx.beginPath();
    ctx.moveTo(offsetX, cy);
    ctx.lineTo(offsetX, cy + size);
    ctx.stroke();
  }

  // 내구도 숫자
  ctx.fillStyle = "white";
  ctx.font = `${size * 0.45}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(strength, cx + size / 2, cy + size / 2);

  // 탱크 아이콘 추가
  if (isTank && tankImage.complete) {
    const iconSize = size * 0.8; // 셀보다 살짝 작게
    const iconX = cx + (size - iconSize) / 2;
    const iconY = cy + (size - iconSize) / 2;

    // 🔹 불투명도 설정
    ctx.save(); // 현재 상태 저장
    ctx.globalAlpha = 0.8; // 불투명하게
    ctx.drawImage(tankImage, iconX, iconY, iconSize, iconSize);
    ctx.restore(); // 이전 상태로 복원
  }
}
