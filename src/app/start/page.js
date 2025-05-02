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

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const minDim = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    cellSize.current = Math.floor(minDim / gridSize);
    canvas.width = cellSize.current * gridSize;
    canvas.height = cellSize.current * gridSize;
  };

  const createGrid = () => {
    const newGrid = [];
    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        row.push({ bomb: null, obstacle: null });
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

  const explodeBomb = (bomb) => {
    const { x, y, power, damage } = bomb;
    const cell = grid.current[y][x];
    cell.bomb = null;

    const additionalBombs = [];
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    dirs.forEach(([dx, dy]) => {
      for (let i = 1; i <= power; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) break;

        const neighbor = grid.current[ny][nx];
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

        if (cell.obstacle) {
          const gray = Math.min(100 + cell.obstacle * 30, 255);
          ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
          ctx.fillRect(cx, cy, cellSize.current, cellSize.current);
          ctx.fillStyle = "white";
          ctx.fillText(cell.obstacle, cx + cellSize.current / 2, cy + cellSize.current / 2);
        }

        if (cell.bomb && cell.bomb.countdown > 0) {
          ctx.fillStyle = "red";
          ctx.fillRect(cx, cy, cellSize.current, cellSize.current);
          ctx.fillStyle = "white";
          ctx.fillText(cell.bomb.countdown, cx + cellSize.current / 2, cy + cellSize.current / 2);
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
      <h1 className="text-2xl text-yellow-400 font-bold mb-4">Bomb Block Game (Canvas)</h1>
      <div className="text-white text-center mb-4 space-y-1">
        <div>Turn: {turn}</div>
        <div>Score: {score}</div>
        <div>Best Score: {bestScore}</div>
        <div>Range: {bombPower} / Damage: {bombDamage}</div>
      </div>
      <canvas ref={canvasRef} className="bg-gray-800" onClick={handleCanvasClick} />
    </div>
  );
}
