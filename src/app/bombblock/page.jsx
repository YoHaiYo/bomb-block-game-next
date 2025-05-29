"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  drawExplosionEffect,
  drawBomb,
  drawParticles,
  createExplosionParticles,
  drawWallBlock,
} from "./graphics";
import { loadBestScore, saveBestScore, formatTime } from "./utils";
import Image from "next/image";
import RankingModal from "./component/RankingModal";
import GameOverModal from "./component/GameOverModal";
import RankingListModal from "./component/RankingListModal";
import UpgradeModal from "./component/UpgradeModal";

export default function Page() {
  const router = useRouter();
  // 🔹 상태 관리 및 참조 초기화
  const canvasRef = useRef(null);
  const gridSize = 8;
  const cellSize = useRef(60);
  const grid = useRef([]);
  const bombQueue = useRef([]);
  const upgradeTurn = 25;
  const gameOver = useRef(false);
  const rankingCutPoint = 2000; // 랭킹 점수컷

  const [turn, setTurn] = useState(75);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef(null); // 타이머 참조
  const [isSumbitScore, setIsSumbitScore] = useState(false); // Submit Score으로 랭킹등록시 RankingModal에 닫기버튼 활성화 여부
  const [bombPower, setBombPower] = useState(1);
  const bombDamageRef = useRef(1);
  const [bombDamage, setBombDamage] = useState(1);
  const [perforation, setPerforation] = useState(1);
  const particles = useRef([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isDescriptionChanging, setIsDescriptionChanging] = useState(false);
  const [description, setDescription] = useState(
    "[Rule] Drop 💣bombs to blast 🧱wall Blocks and earn 🏆points!"
  );
  const [isDanger, setIsDanger] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [showRankingList, setShowRankingList] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState(null);

  const [ownedSpecialWeapons, setOwnedSpecialWeapons] = useState({
    tank: 9,
    bomber: 9,
    nuke: 3,
  });

  // 🔹 캔버스 크기 자동 조정
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 32;
    const availableWidth = window.innerWidth - padding * 2;
    const extraVerticalSpace = 200; // 상단+하단 UI 여유 공간
    const availableHeight =
      window.innerHeight - padding * 2 - extraVerticalSpace;
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

  // 🔹 장애물 무작위 배치 (count : 추가될 벽 개수)
  const placeRandomObstacles = (count = 1) => {
    let attempts = 0;
    while (count > 0 && attempts < 100) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      const cell = grid.current[y][x];

      if (!cell.bomb && !cell.obstacle) {
        const strength = getObstacleStrength(turn); // 벽 내구도
        cell.obstacle = strength;
        count--;
      } else if (cell.obstacle) {
        const minStrength = getObstacleStrength(turn);
        cell.obstacle = Math.max(cell.obstacle + 1, minStrength);
        count--;
      }
      attempts++;
    }
  };
  // 벽 내구도
  const getObstacleStrength = (turn) => {
    if (turn < 50) return 1;
    if (turn < 150) return 2;
    if (turn < 300) return 3;
    if (turn < 450) return 4;
    if (turn < 600) return 5;
    // 600턴 이후: 지수적으로 상승
    const extraTurns = turn - 600;
    const strength = 5 + Math.floor(Math.pow(extraTurns / 100, 1.3)); // 지수적으로 증가
    return Math.min(strength, 99); // 상한 설정 (optional)
  };
  // 벽 내구도 별 색상
  function getObstacleColor(strength) {
    let lightness;
    if (strength <= 10) {
      // 내구도 1~10: 1 단위로 점차 어둡게
      lightness = 60 - strength * 4;
    } else {
      // 내구도 11 이상: 10 단위로 단계적으로 어둡게
      const overLevel = Math.floor((strength - 1) / 10); // 11~20→1, 21~30→2, ...
      lightness = 20 - overLevel * 5;
    }
    // 최소 밝기 제한
    lightness = Math.max(lightness, 5);
    return `hsl(0, 0%, ${lightness}%)`;
  }

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

  // 🔹 폭탄 폭발 처리
  const explodeBomb = (bomb) => {
    const { x, y, power, damage } = bomb;
    const cell = grid.current[y][x];
    cell.bomb = null;
    cell.explosionDirection = "center";
    startExplosionEffect(cell);
    createExplosionParticles(x, y, cellSize, particles);

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
          setScore((s) => {
            const nextScore = s + (neighbor.obstacle <= 0 ? 2 : 1);
            handleScoreUpdate(nextScore);
            return nextScore;
          });

          const wasDestroyed = neighbor.obstacle <= 0;
          if (wasDestroyed) {
            // 💥 탱크블럭 파괴되었을 때
            if (neighbor.specialType === "tank") {
              setOwnedSpecialWeapons((prev) => ({
                ...prev,
                tank: prev.tank + 1,
              }));
            }
            neighbor.specialType = null; // 마킹 해제
            neighbor.obstacle = null;
          }

          penetrated++;
          if (penetrated >= perforation) break;
        }

        if (neighbor.bomb && neighbor.bomb.countdown > 0) {
          neighbor.bomb.countdown = 0;
          additionalBombs.push(neighbor.bomb);
        }
      }
    });

    return additionalBombs;
  };

  // 폭탄 데미지 업데이트
  const updateBombDamage = (fn) => {
    setBombDamage((prev) => {
      const next = fn(prev);
      bombDamageRef.current = next;
      return next;
    });
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
        if (!explodedSet.has(k)) {
          queue.push(b);
        }
      });
    }

    bombQueue.current = bombQueue.current.filter((b) => b.countdown > 0);

    if ((turn + 1) % 3 === 0) {
      // 3배수 턴마다 장애물 생성
      placeRandomObstacles(Math.floor((turn + 1) / 3));
    }
    if ((turn + 1) % upgradeTurn === 0) {
      // 업그레이드 턴마다 업글 카드 표출
      setShowUpgrade(true);
      return;
    }
    if ((turn + 1 - 77) % 100 === 0) {
      // 77턴에서 100턴마다 특수블럭 소환
      transformToSpecialBlock(turn);
    }

    updateDescriptionByTurn(turn);

    checkGameOver();
    saveBestScore();
  };

  // 해설창 멘트 관리
  const descriptionMap = {
    3: "💣Bombs explode after 3 turns!",
    5: "🧱Wall Block full=Game Over. Good luck!🍀",
    26: `Upgrade cards appear every ${upgradeTurn} turns. Choose wisely to survive!`,
  };
  const updateDescriptionByTurn = (currentTurn) => {
    const realTurn = currentTurn + 1;
    const message = descriptionMap[realTurn];
    if (message) {
      animateDescriptionChange(message);
    }
  };
  const animateDescriptionChange = (message) => {
    setIsDescriptionChanging(true);
    setTimeout(() => {
      setDescription(message);
      setIsDescriptionChanging(false);
    }, 200);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedUpgrade) return;
    if (selectedUpgrade === "range") setBombPower((prev) => prev + 1);
    if (selectedUpgrade === "damage") updateBombDamage((prev) => prev + 1);
    if (selectedUpgrade === "penetrate") setPerforation((prev) => prev + 1);

    setShowUpgrade(false);
    setSelectedUpgrade(null);
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
          let color;
          switch (cell.specialType) {
            case "tank":
              color = "hsl(120, 60%, 25%)"; // 초록
              break;
            case "bomber":
              color = "hsl(210, 60%, 25%)"; // 네이비 블루
              break;
            case "nuke":
              color = "hsl(30, 100%, 35%)"; // 주황 계열
              break;
            default:
              color = getObstacleColor(cell.obstacle);
          }
          drawWallBlock(
            ctx,
            cx,
            cy,
            cellSize.current,
            cell.obstacle,
            color,
            cell.specialType // ← 여기에서 필요하면 drawWallBlock에서도 처리
          );
        }

        // 🔹 폭탄 렌더링
        if (cell.bomb && cell.bomb.countdown > 0) {
          drawBomb(ctx, cell, cx, cy, cellSize.current, bombDamageRef.current);
        }
      }
    }

    // 그리드 다 돌고 난 뒤 파티클 여기에서 한 번만 호출해야 함
    drawParticles(ctx, particles.current);
    requestAnimationFrame(drawGrid);
  };

  // 🔹 게임 종료 판정
  const checkGameOver = () => {
    const emptyCells = grid.current
      .flat()
      .filter((c) => !c.bomb && !c.obstacle);
    const emptyCount = emptyCells.length;

    // 게임오버 판정 emptyCount === 0 @@
    if (emptyCount === 0) {
      gameOver.current = true;
      setIsGameOver(true);
      clearInterval(timerRef.current); // ⛔️ 타이머 멈추기
    }

    // ⚠️ 경고 상태 진입 (5칸 이하만 남았을 때)
    if (emptyCount <= 5 && !isDanger) {
      setIsDanger(true);
      animateDescriptionChange(
        "⚠️Wall Block is nearly full. Game Over is imminent!"
      );
    }

    // ✅ 안전 상태 복구
    if (emptyCount > 5 && isDanger) {
      setIsDanger(false);
      animateDescriptionChange("✅Danger is over. Keep going!");
    }
  };

  /* 특수블럭 */
  const transformToSpecialBlock = (turn) => {
    const allObstacles = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = grid.current[y][x];
        if (cell.obstacle) {
          allObstacles.push({ x, y, strength: cell.obstacle });
        }
      }
    }

    // ✅ 필터링 비율은 턴 수에 따라 점점 좁힘
    // 최소 5%, 최대 30%, 턴 600 이상이면 거의 최상위만
    const minRatio = 0.05;
    const maxRatio = 0.3;
    const ratio = Math.max(minRatio, maxRatio - turn / 1000); // 선형 감소
    const sorted = allObstacles.sort((a, b) => b.strength - a.strength);
    const count = Math.ceil(sorted.length * ratio);
    const topObstacles = sorted.slice(0, count);

    if (topObstacles.length > 0) {
      const picked =
        topObstacles[Math.floor(Math.random() * topObstacles.length)];
      const cell = grid.current[picked.y][picked.x];

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
  const handleUseSpecialBomb = (type) => {
    if (ownedSpecialWeapons[type] > 0) {
      console.log(`💥 ${type} 폭탄 사용!`);

      setOwnedSpecialWeapons((prev) => ({
        ...prev,
        [type]: prev[type] - 1,
      }));

      // 💣 폭탄 타입별 효과 분기
      switch (type) {
        case "tank":
          applyTankBlast();
          break;
        case "bomber":
          // applyBomberBlast(); // 아직 구현 안 됐으면 임시 로그만
          break;
        case "nuke":
          // applyNukeBlast(); // 나중에 구현 예정
          break;
        default:
          console.warn(`Unknown bomb type: ${type}`);
      }
    } else {
      console.log(`❌ ${type} 폭탄이 없습니다.`);
    }
  };

  const applyTankBlast = () => {
    // 중심점을 기준으로 상하좌우 1칸 → 총 3x3 범위
    const centerX = Math.floor(Math.random() * gridSize);
    const centerY = Math.floor(Math.random() * gridSize);

    console.log(`💥 탱크블럭 사용: 중심 (${centerX}, ${centerY})`);

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = centerX + dx;
        const cy = centerY + dy;

        // 🔒 경계 조건 체크
        if (cx < 0 || cy < 0 || cx >= gridSize || cy >= gridSize) continue;

        const cell = grid.current[cy][cx];
        // 이펙트에 탱크타입에 적용
        cell.explosionDirection = "tank";
        // 폭파 이펙트
        startExplosionEffect(cell);
        createExplosionParticles(cx, cy, cellSize, particles, {
          intense: true,
        });

        // 폭파 데미지
        if (cell.obstacle) {
          cell.obstacle -= 50;
          if (cell.obstacle <= 0) {
            cell.obstacle = null;
          }
        }
      }
    }
  };

  /* useEffect */
  // 🔹 최고 점수 로딩/저장
  useEffect(() => {
    const savedBestScore = loadBestScore();
    setBestScore(savedBestScore);
  }, []);

  const handleScoreUpdate = (newScore) => {
    const updatedBestScore = saveBestScore(newScore, bestScore);
    setBestScore(updatedBestScore);
    return newScore;
  };

  // 🔹 초기 렌더링 시 게임 세팅
  useEffect(() => {
    resizeCanvas();
    createGrid();
    placeRandomObstacles(10);
    const savedBestScore = loadBestScore();
    setBestScore(savedBestScore);
    drawGrid();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // 🔹 타이머 시작 (매 1초마다 경과 시간 증가)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // 🔹 UI 및 캔버스 출력
  return (
    <section className="min-h-screen flex flex-col items-center justify-start bg-gray-900 py-2">
      {/* 헤더/로고 영역 */}
      <div className="w-full flex justify-start mb-1 px-3">
        <div className="flex items-center gap-2">
          <Image
            onClick={() => router.push("/")}
            src="/img/BlockGG_logo.png"
            width={60}
            height={0}
            alt="BlockGG Logo"
            className="object-contain cursor-pointer"
          />
          <div>
            <span className="text-xs sm:text-base text-white flex items-center gap-1 ml-2">
              <i className="fa-solid fa-arrow-left mr-1" />
              Want more games?
            </span>
            <div className="flex items-center gap-1 mt-1">
              <button
                onClick={() => {
                  if (score >= rankingCutPoint) {
                    clearInterval(timerRef.current); // 타이머 멈추기
                    setShowRankingModal(true);
                    setIsSumbitScore(true);
                  }
                }}
                className={`text-xs sm:text-sm font-bold border px-2 py-1 ${
                  score >= rankingCutPoint
                    ? "text-green-300 border-green-400 hover:bg-green-700"
                    : "text-gray-500 border-gray-600 cursor-not-allowed"
                }`}
              >
                📝 Submit Score
              </button>
              <button
                onClick={() => setShowRankingList(true)}
                className="text-xs sm:text-sm text-green-300 font-bold border border-green-400 px-2 py-1 hover:bg-green-700"
              >
                🏆 View Rankings
              </button>
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-3xl font-mono text-green-400 font-bold mb-2">
        💣Bomb Block Game
      </h2>
      {/* 점수판  */}
      <div className="mb-2">
        <div className="bg-black text-white font-mono tracking-widest px-2 md:px-6 py-3  border border-green-500 shadow-lg ring-2 ring-lime-400 ring-opacity-50 text-center space-y-2">
          <div className="flex justify-center gap-8 text-lgxxx text-xs sm:text-base">
            <span>
              TURN:
              <span className="text-green-500">{turn}</span>
            </span>
            <span>
              SCORE:<span className="text-red-500">{score}</span>
            </span>
            <span>
              BEST:<span className="text-red-500">{bestScore}</span>
            </span>
            <span className="text-yellow-400">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex justify-center gap-8 text-lgxxx text-xs sm:text-base">
            <span>
              RANGE:<span className="text-orange-500">{bombPower}</span>
            </span>
            <span>
              DAMAGE:<span className="text-orange-500">{bombDamage}</span>
            </span>
            <span>
              PERFORATION:<span className="text-orange-400">{perforation}</span>
            </span>
          </div>

          <hr />

          {/* 특수폭탄 선택*/}
          <div className="flex justify-around !mt-0">
            {/* 탱크폭탄 */}
            <div
              onClick={() => {
                handleUseSpecialBomb("tank");
              }}
              className="relative w-10 h-10 cursor-pointer"
            >
              <img
                src="/img/tank.png"
                alt="Tank Bomb"
                className={`w-full h-full object-contain ${
                  ownedSpecialWeapons.tank > 0
                    ? "opacity-80 hover:opacity-100"
                    : "opacity-30 cursor-not-allowed"
                }`}
              />
              <span className="absolute -bottom-2 right-0 text-xs bg-blackxxx text-white px-1 rounded">
                x {ownedSpecialWeapons.tank || 0}
              </span>
            </div>

            {/* 폭격기 */}
            <div
              onClick={() => {
                handleUseSpecialBomb("bomber");
              }}
              className="relative w-10 h-10 cursor-pointer"
            >
              <img
                src="/img/bomber.png"
                alt="Bomber Bomb"
                className={`w-full h-full object-contain ${
                  ownedSpecialWeapons.tank > 0
                    ? "opacity-80 hover:opacity-100"
                    : "opacity-30 cursor-not-allowed"
                }`}
              />
              <span className="absolute -bottom-2 right-0 text-xs bg-blackxxx text-white px-1 rounded">
                x {ownedSpecialWeapons.bomber || 0}
              </span>
            </div>

            {/* 핵폭탄 */}
            <div
              onClick={() => {
                handleUseSpecialBomb("nuke");
              }}
              className="relative w-10 h-10 cursor-pointer"
            >
              <img
                src="/img/nuke.png"
                alt="Nuke Bomb"
                className={`w-full h-full object-contain ${
                  ownedSpecialWeapons.nuke > 0
                    ? "opacity-80 hover:opacity-100"
                    : "opacity-30 cursor-not-allowed"
                }`}
              />
              <span className="absolute -bottom-2 right-0 text-xs bg-blackxxx text-white px-1 rounded">
                x {ownedSpecialWeapons.nuke || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 본 게임 */}
      <canvas
        ref={canvasRef}
        className="bg-gray-800"
        onClick={handleCanvasClick}
      />
      {/* 해설 UI창 */}
      <div
        className={`mt-4 text-white text-sm sm:text-base px-6 py-3  font-mono w-full max-w-xl text-center shadow transition-all duration-300 ${
          isDescriptionChanging ? "opacity-0 scale-95" : "opacity-100 scale-100"
        } ${
          isDanger ? "border-red-500" : "border-lime-400"
        } border bg-gray-800`}
      >
        {description}
      </div>

      {/* User Feedback Message */}
      <div className="text-yellow-200 text-xs sm:text-sm px-6 py-2 font-mono w-full max-w-xl text-center">
        {`The game is continuously evolving based on your feedback. Share your thoughts when submitting your score! You can submit your score to the ranking if it's over ${rankingCutPoint} points. I'll do my best to reflect your input. Enjoy!`}
      </div>

      {/* 업그레이드 카드 */}
      {showUpgrade && (
        <UpgradeModal
          show={showUpgrade}
          bombPower={bombPower}
          bombDamage={bombDamage}
          perforation={perforation}
          selectedUpgrade={selectedUpgrade}
          setSelectedUpgrade={setSelectedUpgrade}
          handleConfirmUpgrade={handleConfirmUpgrade}
        />
      )}
      {/* 게임오버 모달 */}
      {isGameOver && (
        <GameOverModal
          show={isGameOver}
          score={score}
          turn={turn}
          elapsedTime={elapsedTime}
          bombPower={bombPower}
          bombDamage={bombDamage}
          perforation={perforation}
          formatTime={formatTime}
          rankingCutPoint={rankingCutPoint}
          onSubmitRanking={() => {
            setShowRankingModal(true);
            setIsGameOver(false);
          }}
        />
      )}
      {/* 랭킹 등록 모달 */}
      {showRankingModal && (
        <RankingModal
          show={showRankingModal}
          onClose={() => {
            setShowRankingModal(false);
            setIsSumbitScore(false);
            // 타이머 재시작
            timerRef.current = setInterval(() => {
              setElapsedTime((prev) => prev + 1);
            }, 1000);
          }}
          onSubmit={() => {}}
          nickname={nickname}
          setNickname={setNickname}
          message={message}
          setMessage={setMessage}
          score={score}
          turn={turn}
          elapsedTime={elapsedTime}
          bombPower={bombPower}
          bombDamage={bombDamage}
          perforation={perforation}
          formatTime={formatTime}
          isSumbitScore={isSumbitScore}
        />
      )}
      {/* 랭킹 리스트 모달 */}
      {showRankingList && (
        <RankingListModal
          show={showRankingList}
          onClose={() => setShowRankingList(false)}
        />
      )}
    </section>
  );
}
