"use client";

import React from "react";

export default function GameOverModal({
  show,
  score,
  turn,
  elapsedTime,
  bombPower,
  bombDamage,
  perforation,
  formatTime,
  onSubmitRanking,
  rankingCutPoint
}) {
  if (!show) return null;
  
  const isEligible = score >= rankingCutPoint;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-60 p-6 text-center shadow-xl w-100xx border border-gray-400">
        <h2 className="text-2xl font-bold text-red-600 mb-4">💥 Game Over!</h2>

        <p className="text-lg text-gray-800 mb-2">
          Score: <span className="font-semibold text-red-500">{score}</span>
        </p>
        <p className="text-sm text-gray-600 mb-2">
          Time:{" "}
          <span className="text-black font-mono">
            {formatTime(elapsedTime)}
          </span>
        </p>
        <p className="text-sm text-gray-700 mb-1 font-mono">
          TURN: <span className="text-blue-700 font-semibold">{turn}</span>
        </p>
        <p className="text-sm text-gray-700 mb-1 font-mono">
          🔥 Range:{" "}
          <span className="text-orange-600 font-semibold">{bombPower}</span>
        </p>
        <p className="text-sm text-gray-700 mb-1 font-mono">
          💥 Damage:{" "}
          <span className="text-orange-600 font-semibold">{bombDamage}</span>
        </p>
        <p className="text-sm text-gray-700 mb-4 font-mono">
          🧿 Penetration:{" "}
          <span className="text-orange-600 font-semibold">{perforation}</span>
        </p>

        {/* 안내 메시지 조건부 렌더링 */}
        {isEligible ? (
          <p className="text-sm text-gray-800 font-semibold mb-4 p-2">
            🎉 Great job! You can enroll ranking!
            <br />
            Submit score now to join the ranking board!
          </p>
        ) : (
          <p className="text-sm text-gray-700 font-medium mb-4 p-2">
            ⚠️ You need at least{" "}
            <span className="text-red-500 font-bold">
              {rankingCutPoint} points
            </span>{" "}
            to register your score.
            <br />
            Try again and beat the threshold!
          </p>
        )}

        <div className="flex items-center justify-center">
          {isEligible ? (
            <button
              className="bg-green-400 hover:bg-green-500 px-6 py-2 text-black font-semibold"
              onClick={onSubmitRanking}
            >
              Submit Ranking
            </button>
          ) : (
            <button
              className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 text-black font-semibold"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
