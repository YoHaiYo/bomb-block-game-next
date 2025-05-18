"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "./component/Footer";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center py-10 px-2">
      {/* 사이트 타이틀 */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-lime-400 font-mono drop-shadow-lg mb-2 tracking-tight">
        BlockGG
      </h1>
      {/* 사이트 소개 멘트 */}
      <p className="text-gray-200 text-center max-w-xl mb-10 text-base sm:text-lg font-light">
        Created by <span className="font-bold text-lime-300">YoHaYo</span>, a
        solo developer who loves block-style games and enjoys inventing new ways
        to play.
        <br />
        Discover unique, addictive, and ever-evolving block games here!
      </p>
      {/* 게임 카드 영역 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Bomb Block Game Card */}
        <div
          className="group bg-gradient-to-br from-yellow-400/20 to-gray-700/60 rounded-2xl shadow-2xl border border-yellow-400 hover:border-yellow-300 hover:shadow-yellow-300/30 transition-all cursor-pointer flex flex-col items-center p-6 hover:scale-105"
          onClick={() => router.push("/bombblock")}
        >
          <div className="relative w-full flex justify-center">
            <Image
              src="/img/bombblock_thumnail.png"
              alt="Bomb Block Game"
              width={320}
              height={180}
              className="rounded-xl border-2 border-yellow-300 shadow-lg group-hover:shadow-yellow-200 transition"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-yellow-300 mt-4 mb-2 font-mono drop-shadow">
            💣 Bomb Block Game
          </h2>
          <p className="text-gray-100 text-center text-base mb-4">
            Drop bombs, blast through wall blocks, and chase your best score.
            <br />
            Simple, fast, and explosively fun!
          </p>
          <button className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-full shadow hover:bg-yellow-300 transition">
            Play Now
          </button>
        </div>
        {/* Elemental Block Game Card (Coming Soon) */}
        <div className="relative bg-gradient-to-br from-blue-400/20 to-gray-700/60 rounded-2xl shadow-2xl border border-blue-400 flex flex-col items-center p-6 opacity-70">
          <div className="absolute top-3 right-3">
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow animate-pulse">
              Coming Soon
            </span>
          </div>
          <div className="w-[320px] h-[180px] bg-gradient-to-br from-blue-200/30 to-purple-400/30 rounded-xl mb-4 flex items-center justify-center">
            <i className="fa-solid fa-flask text-6xl text-blue-400 opacity-70" />
          </div>
          <h2 className="text-2xl font-bold text-blue-300 mb-2 font-mono drop-shadow">
            🧪 Elemental Block Game
          </h2>
          <p className="text-gray-100 text-center text-base mb-4">
            Mix elements, trigger chain reactions, and master the elemental
            grid.
            <br />
            <span className="text-blue-300 font-bold">In development...</span>
          </p>
          <button
            className="px-6 py-2 bg-gray-400 text-white font-bold rounded-full cursor-not-allowed"
            disabled
          >
            Coming Soon
          </button>
        </div>
      </div>
      {/* 하단 안내(선택) */}
      <div className="mt-12 text-gray-500 text-sm text-center">
        &copy; {new Date().getFullYear()} BlockGG by{" "}
        <Link href="https://github.com/YoHaiYo" className="text-blue-500">
          YoHaiYo
        </Link>
        . All rights reserved.
      </div>
    </div>
  );
}
