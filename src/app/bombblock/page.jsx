"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const canvasRef = useRef(null);
  const gridSize = 8;
  const cellSize = useRef(60);
  const grid = useRef([]);
  const bombQueue = useRef([]);
  const gameOver = useRef(false);

  const [turn, setTurn] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [bombPower] = useState(1);
  const [bombDamage] = useState(1);
  const particles = useRef([]);

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
        });
      }
      newGrid.push(row);
    }
    grid.current = newGrid;
  };

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

  const placeBomb = (x, y) => {
    const cell = grid.current[y][x];
    if (!cell.bomb && !cell.obstacle) {
      const bomb = { x, y, countdown: 3, power: bombPower, damage: bombDamage };
      cell.bomb = bomb;
      bombQueue.current.push(bomb);
    }
  };

  const startExplosionEffect = (cell) => {
    cell.explodeTimer = 15;
    cell.flashPhase = 0;
  };

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

  const explodeBomb = (bomb) => {
    const { x, y, power, damage } = bomb;
    const cell = grid.current[y][x];
    cell.bomb = null;
    startExplosionEffect(cell);
    createExplosionParticles(x, y);

    const additionalBombs = [];
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    dirs.forEach(([dx, dy]) => {
      for (let i = 1; i <= power; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) break;

        const neighbor = grid.current[ny][nx];
        startExplosionEffect(neighbor);

        if (neighbor.obstacle) {
          neighbor.obstacle -= damage;
          setScore((s) => s + (neighbor.obstacle <= 0 ? 2 : 1));
          if (neighbor.obstacle <= 0) neighbor.obstacle = null;
          break;
        }

        if (neighbor.bomb && neighbor.bomb.countdown > 0) {
          neighbor.bomb.countdown = 0;
          additionalBombs.push(neighbor.bomb);
        }
      }
    });

    return additionalBombs;
  };

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

    checkGameOver();
    saveBestScore();
  };

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

        // 폭발 이펙트
        if (cell.explodeTimer > 0) {
          const centerX = cx + cellSize.current / 2;
          const centerY = cy + cellSize.current / 2;
          const baseSize = cellSize.current * 0.5;

          // 내부 붉은 폭발
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.ellipse(
            centerX,
            centerY,
            baseSize * 0.9,
            baseSize * 0.7,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // 외곽 노란 폭발
          ctx.fillStyle = "yellow";
          ctx.beginPath();
          ctx.ellipse(
            centerX,
            centerY,
            baseSize * 1.2,
            baseSize * 1.0,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          cell.explodeTimer--;
          if (cell.explodeTimer % 5 === 0) {
            cell.flashPhase++;
          }
        }

        // 장애물
        if (cell.obstacle) {
          const lightness = Math.max(20, 60 - cell.obstacle * 8);
          ctx.fillStyle = `hsl(0, 0%, ${lightness}%)`;
          ctx.fillRect(cx, cy, cellSize.current, cellSize.current);
          ctx.fillStyle = "white";
          ctx.fillText(
            cell.obstacle,
            cx + cellSize.current / 2,
            cy + cellSize.current / 2
          );
        }

        // 폭탄
        if (cell.bomb && cell.bomb.countdown > 0) {
          // 둥근 검은 폭탄
          const cxCenter = cx + cellSize.current / 2;
          const cyCenter = cy + cellSize.current / 2;
          const radius = cellSize.current * 0.35;

          // 폭탄 몸통
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

          // 카운트 심지 위 불꽃
          const fireSize = (4 - cell.bomb.countdown) * 2 + 3; // countdown: 3→3px, 2→5px, 1→7px
          const fireColor = cell.bomb.countdown === 1 ? "red" : "orange";

          ctx.fillStyle = fireColor;
          ctx.beginPath();
          ctx.ellipse(
            cxCenter - 5,
            cyCenter - radius - 12, // 심지 위
            fireSize,
            fireSize * 0.8,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.font = `${cellSize.current * 0.4}px sans-serif`;
          ctx.fillText(bombDamage, cxCenter, cyCenter);
        }
      }
    }

    requestAnimationFrame(drawGrid);
  };

  const checkGameOver = () => {
    const hasEmpty = grid.current.flat().some((c) => !c.bomb && !c.obstacle);
    if (!hasEmpty) {
      gameOver.current = true;
      alert("Game Over! Refresh to restart.");
    }
  };

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

  useEffect(() => {
    resizeCanvas();
    createGrid();
    placeRandomObstacles(10);
    loadBestScore();
    drawGrid();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-900 p-4">
      <h1 className="text-2xl text-yellow-400 font-bold mb-4">
        Bomb Block Game (Canvas)
      </h1>
      <div className="text-white text-center mb-4 text-base space-y-1">
        <div className="flex gap-6 justify-center">
          <span>Turn: {turn}</span>
          <span>Score: {score}</span>
          <span>Best: {bestScore}</span>
        </div>
        <div className="flex gap-6 justify-center">
          <span>Range: {bombPower}</span>
          <span>Damage: {bombDamage}</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="bg-gray-800"
        onClick={handleCanvasClick}
      />
    </div>
  );
}
