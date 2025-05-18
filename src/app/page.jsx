"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center px-4 py-10">
      {/* 로고 + 소개 영역을 나란히 구성 */}
      <section className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-6 sm:gap-12 max-w-5xl mb-16 px-4">
        {/* 로고 */}
        <Image
          src="/img/BlockGG_logo.png"
          width={80}
          height={80}
          alt="BlockGG Logo"
          className="object-contain"
        />

        {/* 소개 텍스트 */}
        <div>
          <p className="text-gray-400 text-base leading-relaxed max-w-xl">
            <span className="text-green-400 font-semibold">BlockGG</span> is a
            one-of-a-kind game platform crafted entirely by{" "}
            <span className="text-green-400 font-semibold">YoHaiYo</span> — a
            solo developer who loves inventing and building creative block-style
            games from scratch.
            <br />
            Each game is a bold experiment: fresh, original, and unlike anything
            you’ve seen before.
          </p>
        </div>
      </section>

      {/* 게임 카드들 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 w-full max-w-5xl">
        {/* Bomb Block Game */}
        <div
          onClick={() => router.push("/bombblock")}
          className="bg-neutral-900  border border-green-400 hover:border-green-300 transition-all cursor-pointer shadow-md hover:shadow-green-400/20 flex flex-col"
        >
          <div className="p-5">
            <Image
              src="/img/bombblock_thumnail.png"
              alt="Bomb Block"
              width={450}
              height={0}
              className="w-full"
            />
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-green-300">
              <i className="fa-solid fa-bomb" /> Bomb Block Game
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Strategic block destruction with timed bombs. Easy to play, hard
              to master.
            </p>
            <button className="w-full py-2 bg-green-400 hover:bg-green-300 text-black font-bold text-sm uppercase">
              <i className="fa-solid fa-play mr-2" /> Play Now
            </button>
          </div>
        </div>

        {/* Elemental Block Game */}
        <div className="bg-neutral-900 border border-green-500 opacity-70 flex flex-col relative">
          <div className="p-5">
            <div className="relative w-full aspect-[450/506] bg-gradient-to-br from-green-200/20 to-emerald-400/30 flex items-center justify-center">
              <div className="absolute top-4 right-4">
                <span className="text-xs bg-green-700 text-white px-3 py-1 font-semibold animate-pulse">
                  Coming Soon
                </span>
              </div>
              <i className="fa-solid fa-flask text-6xl text-green-300 opacity-80" />
            </div>
            <h3 className="text-xl font-bold mt-4 mb-2 flex items-center gap-2 text-green-300">
              <i className="fa-solid fa-flask" /> Elemental Block Game
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Mix elements. Chain reactions. A new kind of logic puzzle awaits.
            </p>
            <button
              className="w-full py-2 bg-gray-600 text-white font-bold text-sm cursor-not-allowed"
              disabled
            >
              <i className="fa-solid fa-hourglass-half mr-2" /> Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="mt-20 text-sm text-gray-500 text-center">
        &copy; {new Date().getFullYear()} BlockGG. Created by{" "}
        <Link
          href="https://github.com/YoHaiYo"
          className="text-green-400 hover:underline"
        >
          YoHaYo
        </Link>
      </footer>
    </div>
  );
}
