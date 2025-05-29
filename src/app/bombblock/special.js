// special.js
export const transformToSpecialBlock = (grid, gridSize, turn) => {
  const allObstacles = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = grid[y][x];
      if (cell.obstacle) {
        allObstacles.push({ x, y, strength: cell.obstacle });
      }
    }
  }
  // ✅ 필터링 비율은 턴 수에 따라 점점 좁힘
  // 최소 5%, 최대 30%, 턴 600 이상이면 거의 최상위만
  const minRatio = 0.05;
  const maxRatio = 0.3;
  const ratio = Math.max(minRatio, maxRatio - turn / 1000);
  const sorted = allObstacles.sort((a, b) => b.strength - a.strength);
  const count = Math.ceil(sorted.length * ratio);
  const topObstacles = sorted.slice(0, count);

  if (topObstacles.length > 0) {
    const picked =
      topObstacles[Math.floor(Math.random() * topObstacles.length)];
    const cell = grid[picked.y][picked.x];

    // ✅ 타입별 확률(%) 정의 및 처리 (누적합의 비율로 확률 처리)
    const chances = [
      { type: "tank", chance: 0 },
      { type: "bomber", chance: 100 },
      { type: "nuke", chance: 0 },
    ];

    const total = chances.reduce((sum, entry) => sum + entry.chance, 0);
    const rand = Math.random() * total;
    let acc = 0;
    for (const entry of chances) {
      acc += entry.chance;
      if (rand < acc) {
        cell.specialType = entry.type;
        break;
      }
    }
  }
};

export const handleUseSpecialBomb = (
  type,
  ownedSpecialWeapons,
  setOwnedSpecialWeapons,
  grid,
  gridSize,
  cellSize,
  particles,
  startExplosionEffect,
  createExplosionParticles
) => {
  if (ownedSpecialWeapons[type] > 0) {
    console.log(`💥 ${type} 폭탄 사용!`);

    setOwnedSpecialWeapons((prev) => ({
      ...prev,
      [type]: prev[type] - 1,
    }));

    switch (type) {
      case "tank":
        applyTankBlast(
          grid,
          gridSize,
          cellSize,
          particles,
          startExplosionEffect,
          createExplosionParticles
        );
        break;
      case "bomber":
        // applyBomberBlast(...);
        break;
      case "nuke":
        // applyNukeBlast(...);
        break;
      default:
        console.warn(`Unknown bomb type: ${type}`);
    }
  } else {
    console.log(`❌ ${type} 폭탄이 없습니다.`);
  }
};

export const applyTankBlast = (
  grid,
  gridSize,
  cellSize,
  particles,
  startExplosionEffect,
  createExplosionParticles
) => {
  // 중심점을 기준으로 상하좌우 1칸 → 총 3x3 범위
  const centerX = Math.floor(Math.random() * gridSize);
  const centerY = Math.floor(Math.random() * gridSize);

  console.log(`💥 탱크블럭 사용: 중심 (${centerX}, ${centerY})`);

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = centerX + dx;
      const cy = centerY + dy;
      if (cx < 0 || cy < 0 || cx >= gridSize || cy >= gridSize) continue;

      const cell = grid[cy][cx];
      cell.explosionDirection = "tank";
      startExplosionEffect(cell);
      createExplosionParticles(cx, cy, cellSize, particles, { intense: true });

      if (cell.obstacle) {
        cell.obstacle -= 50;
        if (cell.obstacle <= 0) {
          cell.obstacle = null;
        }
      }
    }
  }
};
