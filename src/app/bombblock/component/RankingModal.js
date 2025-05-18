"use client";

import React from "react";
import { supabase } from "@/utils/supabase";
import { useState } from "react";

export default function RankingModal({
  show,
  onClose,
  onSubmit,
  nickname,
  setNickname,
  message,
  setMessage,
  score,
  turn,
  elapsedTime,
  bombPower,
  bombDamage,
  perforation,
  formatTime,
  gameName = "bombblock",
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show) return null;

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      alert("Please enter your nickname.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. game_info 테이블에서 game_id 조회
      const { data: gameInfo, error: gameInfoError } = await supabase
        .from("game_info")
        .select("id")
        .eq("game_name", gameName)
        .single();

      if (gameInfoError || !gameInfo) {
        throw new Error("Game ID not found.");
      }

      const gameId = gameInfo.id;

      // 2. JSON 데이터 구성
      const rankingContent = {
        score,
        turn,
        time: elapsedTime,
        power: bombPower,
        damage: bombDamage,
        perforation,
      };

      // 3. game_ranking 테이블에 저장
      const { error: insertError } = await supabase
        .from("game_ranking")
        .insert([
          {
            game_id: gameId,
            nickname,
            message,
            ranking_content: rankingContent,
          },
        ]);

      if (insertError) {
        throw new Error("Failed to submit ranking.");
      }

      // ✅ 등록 성공 시
      alert(
        "Your score has been submitted! Click 'View Rankings' to see the ranking board."
      );
      window.location.reload();
    } catch (err) {
      console.error("Ranking submission error:", err);
      alert("❌ Error submitting ranking: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white bg-opacity-90 p-6 sm:p-8 shadow-2xl w-full max-w-md text-center border border-gray-400">
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          🏆 Submit Your Score
        </h2>

        {/* 게임 정보 */}
        <div className="text-gray-800 font-mono text-sm sm:text-base space-y-1 mb-6">
          <p>
            Score: <span className="text-red-500 font-bold">{score}</span>
          </p>
          <p>
            Time:{" "}
            <span className="text-black font-semibold">
              {formatTime(elapsedTime)}
            </span>
          </p>
          <p>
            TURN: <span className="text-blue-700 font-semibold">{turn}</span>
          </p>
          <p>
            🔥 Range:{" "}
            <span className="text-orange-600 font-semibold">{bombPower}</span>
          </p>
          <p>
            💥 Damage:{" "}
            <span className="text-orange-600 font-semibold">{bombDamage}</span>
          </p>
          <p>
            🧿 Penetration:{" "}
            <span className="text-orange-600 font-semibold">{perforation}</span>
          </p>
        </div>

        {/* 입력 필드 */}
        <div className="space-y-4 text-left mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nickname
            </label>
            <input
              type="text"
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={4}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-black resize-y focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Feel free to write your thoughts on the game!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center gap-4">
          <button
            className="bg-green-400 hover:bg-green-400 text-white px-5 py-2 font-bold"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>

          {/* <button
            className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 font-bold"
            onClick={onClose}
          >
            Cancel
          </button> */}
        </div>
      </div>
    </div>
  );
}
