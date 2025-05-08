"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "./component/Footer";

export default function LandingPage() {
  const router = useRouter();

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white font-mono flex flex-col items-center justify-center px-4">
        {/* 게임 제목 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-400 tracking-wide mb-6 text-center flex items-center gap-3">
          🎮 Bomb Block Game
        </h1>

        {/* 서브텍스트 */}
        <p className="text-sm sm:text-base text-gray-300 mb-10 text-center max-w-md">
          Blow up blocks, chain reactions, and power up your bombs. How long can
          you survive?
        </p>

        {/* 시작 버튼 */}
        <button
          onClick={() => router.push("/bombblock")}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-lg sm:text-xl px-8 py-3 rounded-lg shadow-lg ring-2 ring-lime-400 ring-opacity-50 transition"
        >
          🚀 Start Game
        </button>
      </div>
      <Footer />
    </>
  );
}
