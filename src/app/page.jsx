"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false); // 모바일 메뉴 상태

  return (
    <>
      {/* 🎯 메인 랜딩 섹션 */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Bomb Block Game
        </h1>

        <button
          onClick={() => {
            router.push("/bombblock");
          }}
          className="bg-amber-500 px-6 py-3 rounded-lg text-lg font-semibold text-white hover:bg-amber-400"
        >
          <i className="fas fa-play mr-2"></i>Play Now
        </button>
      </section>
    </>
  );
}
