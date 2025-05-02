"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false); // 모바일 메뉴 상태

  // 로그인 되어있으면 자동으로 /start 이동
  useEffect(() => {
    const checkLoginPushStart = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) return router.push("/start");
      } catch (error) {
        console.error("에러 발생:", error);
      }
    };
    checkLoginPushStart();
  }, []);

  const handleLogin = () => {
    router.push("/login"); // 로그인 페이지로 이동
  };

  return (
    <>
      {/* 🎯 메인 랜딩 섹션 */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Smarter Attendance, <span className="text-amber-500">Anywhere</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-10">
          Next.js + supabase + tailwindCSS + fontawesome
          <br />
          웹프로젝트 템플릿
        </p>
        <button
          onClick={handleLogin}
          className="bg-amber-500 px-6 py-3 rounded-lg text-lg font-semibold text-white hover:bg-amber-400"
        >
          <i className="fas fa-play mr-2"></i>Get Started
        </button>
      </section>
    </>
  );
}
