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
      { type: "tank", chance: 60 },
      { type: "bomber", chance: 30 },
      { type: "nuke", chance: 10 },
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
        applyBomberBlast(
          grid,
          gridSize,
          cellSize,
          particles,
          startExplosionEffect,
          createExplosionParticles
        );
        break;
      case "nuke":
        applyNukeBlast(
          grid,
          gridSize,
          cellSize,
          particles,
          startExplosionEffect,
          createExplosionParticles
        );
        break;
      default:
        console.warn(`Unknown bomb type: ${type}`);
    }
  } else {
    console.log(`❌ ${type} 폭탄이 없습니다.`);
  }
};

const applyTankBlast = (
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

const applyBomberBlast = (
  grid,
  gridSize,
  cellSize,
  particles,
  startExplosionEffect,
  createExplosionParticles
) => {
  console.log("💣 폭격기 출격!");

  const direction = Math.random() < 0.5 ? "↘" : "↗";
  const path = [];

  for (let i = 0; i < gridSize; i++) {
    const x = i;
    const y = direction === "↘" ? i : gridSize - 1 - i;
    path.push({ x, y });
  }

  let index = 0;
  const damage = 50;
  const interval = setInterval(() => {
    if (index >= path.length) {
      clearInterval(interval);
      return;
    }

    const { x, y } = path[index];
    console.log(`🚁 폭격기 위치: (${x}, ${y})`);

    const dropCount = 3; // 해당 좌표에서 폭탄 몇개 떨굴지 정함함
    for (let i = 0; i < dropCount; i++) {
      // 폭탄 낙하 좌표계산 - 대각으로 이동하는 3x3 좌표
      const dx = Math.floor(Math.random() * 3) - 1;
      const dy = Math.floor(Math.random() * 3) - 1;
      const cx = x + dx;
      const cy = y + dy;
      // 그리드 범위밖 무시
      if (cx < 0 || cy < 0 || cx >= gridSize || cy >= gridSize) continue;
      // 폭발효과 시작
      const cell = grid[cy][cx];
      cell.explosionDirection = "bomber";
      startExplosionEffect(cell);
      createExplosionParticles(cx, cy, cellSize, particles, { intense: false });

      if (cell.obstacle) {
        cell.obstacle -= damage;
        if (cell.obstacle <= 0) {
          cell.obstacle = null;
          cell.specialType = null;
        }
      }
    }

    index++;
  }, 150);
};
const applyNukeBlast = (
  grid,
  gridSize,
  cellSize,
  particles,
  startExplosionEffect,
  createExplosionParticles
) => {
  console.log("☢️ 핵폭탄 발동!");

  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  const radius = 3;
  const damage = 70;

  // 1. 모든 셀에 깜빡임 마킹 (drawGrid에서 처리됨)
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      grid[y][x].flashFrame = 6; // 6프레임 = 약 300ms 깜빡임
    }
  }

  // 2. 깜빡임 후 실제 폭발
  setTimeout(() => {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
          const cell = grid[y][x];
          cell.explosionDirection = "nuke";
          startExplosionEffect(cell);
          createExplosionParticles(x, y, cellSize, particles, {
            intense: true,
          });

          if (cell.obstacle) {
            cell.obstacle -= damage;
            if (cell.obstacle <= 0) {
              cell.obstacle = null;
              cell.specialType = null;
            }
          }

          if (cell.bomb) {
            cell.bomb = null;
          }
        }
      }
    }
  }, 300); // 300ms 후 폭발
};
