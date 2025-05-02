"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false); // 모바일 메뉴 열림 여부
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login"); // 로그인 페이지 이동
  };

  return (
    <>
      {/* 🧭 네비게이션 바 */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        {/* 로고 */}
        <Link
          href="/"
          className="text-2xl font-bold text-amber-500 flex items-center"
        >
          <i className="fas fa-map-marker-alt mr-2"></i>CheckAround
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex items-center space-x-4 text-sm md:text-base">
          <button className="hover:text-amber-500">
            <i className="fas fa-bullhorn mr-1"></i>About
          </button>
          <button className="hover:text-amber-500">
            <i className="fas fa-cogs mr-1"></i>Features
          </button>
          <button className="hover:text-amber-500">
            <i className="fas fa-envelope mr-1"></i>Contact
          </button>
          <button
            onClick={handleLogin}
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-400"
          >
            <i className="fas fa-sign-in-alt mr-1"></i>Login
          </button>
        </div>

        {/* 모바일 햄버거 아이콘 */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <i className="fas fa-bars text-2xl text-amber-500"></i>
          </button>
        </div>
      </nav>

      {/* 📱 모바일 메뉴 드롭다운 */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center space-y-2 py-4 border-b border-gray-200">
          <button className="hover:text-amber-500">
            <i className="fas fa-bullhorn mr-1"></i>About
          </button>
          <button className="hover:text-amber-500">
            <i className="fas fa-cogs mr-1"></i>Features
          </button>
          <button className="hover:text-amber-500">
            <i className="fas fa-envelope mr-1"></i>Contact
          </button>
          <button
            onClick={handleLogin}
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-400"
          >
            <i className="fas fa-sign-in-alt mr-1"></i>Login
          </button>
        </div>
      )}
    </>
  );
}
