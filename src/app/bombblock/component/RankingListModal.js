"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function RankingListModal({
  show,
  onClose,
  gameName = "bombblock",
}) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!show) return;

    const fetchRankings = async () => {
      setLoading(true);
      // 1. game_id 조회
      const { data: gameInfo } = await supabase
        .from("game_info")
        .select("id")
        .eq("game_name", gameName)
        .single();

      if (!gameInfo) return;

      const gameId = gameInfo.id;

      // 2. 랭킹 조회 (score 내림차순)
      const { data: rankingsData } = await supabase
        .from("game_ranking")
        .select("nickname, message, ranking_content, developer_msg")
        .eq("game_id", gameId);

      const sorted = (rankingsData || []).sort(
        (a, b) => b.ranking_content.score - a.ranking_content.score
      );
      console.log(sorted);

      setRankings(sorted || []);
      setLoading(false);
    };

    fetchRankings();
  }, [show, gameName]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 text-white z-50 flex flex-col items-center px-6 py-10 overflow-y-auto">
      {/* 닫기 버튼 (폰트어썸 아이콘) */}
      <button
        className="absolute top-4 right-4 text-white text-2xl hover:text-green-400 transition"
        onClick={onClose}
        aria-label="Close"
      >
        <i className="fa-solid fa-xmark" />
      </button>

      {/* 타이틀 */}
      <h2 className="text-3xl font-bold mb-6 mt-2 sm:mt-0">🏆 Ranking Board</h2>

      {loading ? (
        <p className="text-gray-300 mt-10">Loading rankings...</p>
      ) : (
        <div className="w-full max-w-3xl flex-1 overflow-y-auto bg-neutral-900 text-white border border-green-500 p-4 space-y-4">
          {rankings.map((item, index) => {
            const { nickname, message, ranking_content, developer_msg } = item;           
            return (
              <div
                key={index}
                className="bg-neutral-800 hover:bg-neutral-700 transition-all border border-green-400 p-4 shadow flex flex-col"
              >
                {/* 상단: 순위 + 이름 + 점수 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 text-green-300 font-bold text-lg">
                    <span>#{index + 1}</span>
                    <span className="text-white font-semibold">{nickname}</span>
                  </div>
                  <div className="text-right text-green-400 font-bold text-lg">
                    {ranking_content.score} Point
                  </div>
                </div>

                {/* 중간: 상세 정보 */}
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>
                    TURN:{" "}
                    <span className="text-white">{ranking_content.turn}</span>
                  </span>
                  <span>
                    TIME:{" "}
                    <span className="text-white">
                      {formatSeconds(ranking_content.time)}
                    </span>
                  </span>
                </div>

                {/* 하단: 메시지 */}
                {message && (
                  <div className="mt-2 text-sm text-gray-400 whitespace-pre-wrap break-words">
                    “{message}”
                  </div>
                )}
                {developer_msg && (
                  <div className="mt-1 text-sm text-green-400 whitespace-pre-wrap break-words ">                    
                    <p className="mt-0 text-green-300">
                    <i className="fa-solid fa-reply fa-rotate-180 text-green-500 mr-1"></i> 
                      <span className="font-bold">Developer : </span>
                      {developer_msg}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatSeconds(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
