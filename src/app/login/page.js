"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase"; // Supabase 유틸리티 파일 import

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const router = useRouter();

  const handleLogin = async () => {
    setError(""); // 에러 메시지 초기화
    setLoading(true); // 로딩 상태 활성화
    try {
      // Supabase 로그인 요청
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError("잘못된 이메일 또는 비밀번호입니다.");
        console.error("로그인 에러:", error.message);
      } else {
        // console.log("로그인 성공:", data);
        console.log("로그인 성공");
        router.push("/start"); // 로그인 성공 후 이동
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.");
      console.error("로그인 요청 에러:", error);
    } finally {
      setLoading(false); // 로딩 상태 비활성화
    }
  };

  // Google 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) {
        console.error("Google 로그인 에러:", error.message);
        alert("Google 로그인 중 문제가 발생했습니다.");
        return;
      }
    } catch (error) {
      console.error("Google 로그인 요청 실패:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">로그인</h1>
        <input
          type="email"
          placeholder="이메일"
          className="border p-2 w-full rounded mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()} // 추가된 부분
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="border p-2 w-full rounded mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()} // 추가된 부분
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={handleLogin}
          className={`bg-blue-500 text-white py-2 px-4 rounded w-full ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "로그인 중..." : "이메일로 로그인"}
        </button>
        {/* Google 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          className="mt-2 flex items-center justify-center text-black py-2 px-4 rounded w-full border border-black"
        >
          <img src="/img/google.png" width={20} className="mr-2"></img>
          구글 계정으로 로그인
        </button>
      </div>
    </div>
  );
}
