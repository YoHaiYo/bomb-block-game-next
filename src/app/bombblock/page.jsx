"use client";

import { useEffect, useRef, useState } from "react";
import { drawExplosionEffect, drawBomb, drawParticles } from "./graphics";

export default function Page() {
  // 🔹 상태 관리 및 참조 초기화
  const canvasRef = useRef(null);
  const gridSize = 8;
  const cellSize = useRef(60);
  const upgradeTurn = 10;
  const grid = useRef([]);
  const bombQueue = useRef([]);
  const gameOver = useRef(false);

  const [turn, setTurn] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [bombPower, setBombPower] = useState(1);
  const [bombDamage, setBombDamage] = useState(1);
  const [perforation, setPerforation] = useState(1);

  const particles = useRef([]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // 🔹 캔버스 크기 자동 조정
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 32;
    const availableWidth = window.innerWidth - padding * 2;
    const availableHeight = window.innerHeight - padding * 2 - 120;
    const size = Math.floor(Math.min(availableWidth, availableHeight));
    cellSize.current = Math.floor(size / gridSize);
    canvas.width = cellSize.current * gridSize;
    canvas.height = cellSize.current * gridSize;
  };

  // 🔹 그리드 초기화 (폭탄, 장애물, 폭발 상태 포함)
  const createGrid = () => {
    const newGrid = [];
    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        row.push({
          bomb: null,
          obstacle: null,
          explodeTimer: 0,
          flashPhase: 0,
          explosionDirection: null, // 십자형 폭발 방향 정보
        });
      }
      newGrid.push(row);
    }
    grid.current = newGrid;
  };

  // 🔹 장애물 무작위 배치
  const placeRandomObstacles = (count = 1) => {
    let attempts = 0;
    while (count > 0 && attempts < 100) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      const cell = grid.current[y][x];
      if (!cell.bomb && !cell.obstacle) {
        cell.obstacle = 1;
        count--;
      } else if (cell.obstacle) {
        cell.obstacle++;
        count--;
      }
      attempts++;
    }
  };

  // 🔹 폭탄 설치
  const placeBomb = (x, y) => {
    const cell = grid.current[y][x];
    if (!cell.bomb && !cell.obstacle) {
      const bomb = { x, y, countdown: 3, power: bombPower, damage: bombDamage };
      cell.bomb = bomb;
      bombQueue.current.push(bomb);
    }
  };

  // 🔹 폭발 효과 초기 설정
  const startExplosionEffect = (cell) => {
    if (!cell) return;
    cell.explodeTimer = 15;
    cell.flashPhase = 0;
  };

  // 🔹 파티클 폭발 효과 생성 (시각 효과용)
  const createExplosionParticles = (x, y) => {
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

  // 🔹 폭탄 폭발 처리 + 연쇄 처리
  const explodeBomb = (bomb) => {
    const { x, y, power, damage } = bomb;
    const cell = grid.current[y][x];
    cell.bomb = null;
    cell.explosionDirection = "center";
    startExplosionEffect(cell);
    createExplosionParticles(x, y);

    const additionalBombs = [];
    const dirs = [
      [1, 0, "right"],
      [-1, 0, "left"],
      [0, 1, "down"],
      [0, -1, "up"],
    ];

    // 🔹 방향별 화염 전파
    dirs.forEach(([dx, dy, dir]) => {
      let penetrated = 0;
      for (let i = 1; i <= power; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) break;

        const neighbor = grid.current[ny][nx];
        neighbor.explosionDirection = dir;
        startExplosionEffect(neighbor);

        if (neighbor.obstacle) {
          neighbor.obstacle -= damage;
          setScore((s) => s + (neighbor.obstacle <= 0 ? 2 : 1));
          if (neighbor.obstacle <= 0) {
            neighbor.obstacle = null;
          } else {
            penetrated++;
            if (penetrated >= perforation) break;
          }
          continue;
        }

        if (neighbor.bomb && neighbor.bomb.countdown > 0) {
          neighbor.bomb.countdown = 0;
          additionalBombs.push(neighbor.bomb);
        }
      }
    });

    return additionalBombs;
  };

  // 🔹 턴 업데이트: 폭탄 처리 + 폭발 + 장애물 추가
  const updateTurn = () => {
    setTurn((prev) => prev + 1);
    bombQueue.current.forEach((b) => b.countdown--);

    const toExplode = bombQueue.current.filter((b) => b.countdown <= 0);
    const explodedSet = new Set();
    const queue = [...toExplode];

    while (queue.length > 0) {
      const bomb = queue.shift();
      const key = `${bomb.x},${bomb.y}`;
      if (explodedSet.has(key)) continue;
      explodedSet.add(key);

      const additional = explodeBomb(bomb);
      additional.forEach((b) => {
        const k = `${b.x},${b.y}`;
        if (!explodedSet.has(k)) queue.push(b);
      });
    }

    bombQueue.current = bombQueue.current.filter((b) => b.countdown > 0);

    if ((turn + 1) % 3 === 0) {
      placeRandomObstacles(Math.floor((turn + 1) / 3));
    }
    if ((turn + 1) % upgradeTurn === 0) {
      setShowUpgrade(true);
      return; // 업그레이드 선택까지 다음 로직 정지
    }

    checkGameOver();
    saveBestScore();
  };

  // 카드 선택 처리 핸들러
  const handleUpgrade = (type) => {
    if (type === "range") setBombPower((prev) => prev + 1);
    else if (type === "damage") setBombDamage((prev) => prev + 1);
    else if (type === "penetrate") setPerforation((prev) => prev + 1);
    setShowUpgrade(false);
  };

  // 🔹 마우스 클릭 → 폭탄 설치
  const handleCanvasClick = (e) => {
    if (gameOver.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize.current);
    const y = Math.floor((e.clientY - rect.top) / cellSize.current);
    const cell = grid.current[y][x];
    if (cell.bomb || cell.obstacle) return;

    placeBomb(x, y);
    updateTurn();
  };

  // 🔹 메인 캔버스 렌더링 루프
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${cellSize.current * 0.5}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = grid.current[y][x];
        const cx = x * cellSize.current;
        const cy = y * cellSize.current;

        ctx.strokeStyle = "black";
        ctx.strokeRect(cx, cy, cellSize.current, cellSize.current);

        // 🔹 폭발 이펙트 (셀 전체 불꽃)
        if (cell.explodeTimer > 0 && cell.explosionDirection) {
          drawExplosionEffect(
            ctx,
            cell,
            cx,
            cy,
            cellSize.current,
            particles.current
          );
        }

        // 🔹 장애물 렌더링
        if (cell.obstacle) {
          const lightness = Math.max(20, 60 - cell.obstacle * 8);
          ctx.fillStyle = `hsl(0, 0%, ${lightness}%)`;
          ctx.fillRect(cx, cy, cellSize.current, cellSize.current);
          // ✅ 폰트는 매번 명시적으로 재지정
          ctx.font = `${cellSize.current * 0.5}px sans-serif`;
          ctx.fillStyle = "white";
          ctx.fillText(
            cell.obstacle,
            cx + cellSize.current / 2,
            cy + cellSize.current / 2
          );
        }

        // 🔹 폭탄 렌더링
        if (cell.bomb && cell.bomb.countdown > 0) {
          drawBomb(ctx, cell, cx, cy, cellSize.current, bombDamage);
        }
      }
    }

    // 그리드 다 돌고 난 뒤 파티클 여기에서 한 번만 호출해야 함
    drawParticles(ctx, particles.current);
    requestAnimationFrame(drawGrid);
  };

  // 🔹 게임 종료 판정
  const checkGameOver = () => {
    const hasEmpty = grid.current.flat().some((c) => !c.bomb && !c.obstacle);
    if (!hasEmpty) {
      gameOver.current = true;
      alert("Game Over! Refresh to restart.");
    }
  };

  // 🔹 최고 점수 로딩/저장
  const loadBestScore = () => {
    const saved = localStorage.getItem("bombBlockBestScore");
    if (saved) setBestScore(parseInt(saved));
  };

  const saveBestScore = () => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("bombBlockBestScore", score.toString());
    }
  };

  // 🔹 초기 렌더링 시 게임 세팅
  useEffect(() => {
    resizeCanvas();
    createGrid();
    placeRandomObstacles(10);
    loadBestScore();
    drawGrid();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // 🔹 UI 및 캔버스 출력
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-900 py-2">
      <h1 className="text-3xl font-mono text-yellow-400 font-bold mb-2">
        🕹️Bomb Block Game
      </h1>
      {/* 점수판  */}
      <div className="mb-3">
        <div className="bg-black text-white font-mono tracking-widest px-6 py-3 rounded-lg border border-yellow-500 shadow-lg ring-2 ring-lime-400 ring-opacity-50 text-center space-y-2">
          <div className="flex justify-center gap-8 text-lgxxx text-xs sm:text-base">
            <span>
              TURN:
              <span className="text-green-500">{turn}</span>
            </span>
            <span>
              SCORE: <span className="text-red-500">{score}</span>
            </span>
            <span>
              BEST: <span className="text-red-500">{bestScore}</span>
            </span>
          </div>
          <div className="flex justify-center gap-8 text-lgxxx text-xs sm:text-base">
            <span>
              RANGE: <span className="text-orange-500">{bombPower}</span>
            </span>
            <span>
              DAMAGE: <span className="text-orange-500">{bombDamage}</span>
            </span>
            <span>
              PERFORATION:{" "}
              <span className="text-orange-400">{perforation}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 본 게임 */}
      <canvas
        ref={canvasRef}
        className="bg-gray-800"
        onClick={handleCanvasClick}
      />
      {/* 업그레이드 카드 */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="max-w-4xl w-full">
            <h2 className="text-center text-white text-xl font-bold mb-6 font-mono">
              Choose an Upgrade to Power Up!
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              {/* Card: Bomb Range */}
              <div
                onClick={() => handleUpgrade("range")}
                className="cursor-pointer w-full sm:w-60 bg-gradient-to-b from-yellow-300 to-yellow-500 border-4 border-yellow-600 rounded-xl p-4 shadow-xl text-center font-mono hover:scale-105 hover:ring-4 hover:ring-yellow-300 transition-transform"
              >
                <div className="text-4xl mb-2">🔥</div>
                <h3 className="text-lg font-bold text-gray-900">
                  Bomb Range +1
                </h3>
                <p className="text-sm text-gray-800 mt-1">
                  Increase how far the explosion travels.
                </p>
                <div className="mt-4 bg-yellow-600 text-white px-3 py-1 rounded-md shadow pointer-events-none">
                  Choose
                </div>
              </div>

              {/* Card: Bomb Damage */}
              <div
                onClick={() => handleUpgrade("damage")}
                className="cursor-pointer w-full sm:w-60 bg-gradient-to-b from-red-400 to-red-600 border-4 border-red-700 rounded-xl p-4 shadow-xl text-center font-mono hover:scale-105 hover:ring-4 hover:ring-red-300 transition-transform"
              >
                <div className="text-4xl mb-2">💥</div>
                <h3 className="text-lg font-bold text-white">Bomb Damage +1</h3>
                <p className="text-sm text-white mt-1">
                  Deal more damage to blocks.
                </p>
                <div className="mt-4 bg-red-800 text-white px-3 py-1 rounded-md shadow pointer-events-none">
                  Choose
                </div>
              </div>

              {/* Card: Perforation */}
              <div
                onClick={() => handleUpgrade("penetrate")}
                className="cursor-pointer w-full sm:w-60 bg-gradient-to-b from-cyan-400 to-blue-600 border-4 border-blue-700 rounded-xl p-4 shadow-xl text-center font-mono hover:scale-105 hover:ring-4 hover:ring-cyan-300 transition-transform"
              >
                <div className="text-4xl mb-2">🧿</div>
                <h3 className="text-lg font-bold text-white">Perforation +1</h3>
                <p className="text-sm text-white mt-1">
                  Break through more blocks per direction.
                </p>
                <div className="mt-4 bg-blue-800 text-white px-3 py-1 rounded-md shadow pointer-events-none">
                  Choose
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
