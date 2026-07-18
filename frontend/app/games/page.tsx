"use client";

import React, { useState, useEffect } from "react";
import GameCard from "../components/books/GameCard";
import { LevelBooksCarousel } from "../components/games/LevelBooksCarousel";
import { Book } from "../../lib/constants/types";
import { ForestPageShell } from "@/app/components/games/forest-background";

// Danh sách các sách có game - sử dụng routes PUBLIC
const gameBooks: Book[] = [
  {
    id: "game_kids",
    name: "KIDS GAMES",
    status: "active",
    imgUrl: "",
    description: "",
    gameUrl: "/games/kids",
  },
  {
    id: "game_starters",
    name: "STARTERS GAMES",
    status: "active",
    imgUrl: "",
    description: "",
    gameUrl: "/games/starters",
  },
  {
    id: "game_movers",
    name: "MOVERS GAMES",
    status: "active",
    imgUrl: "",
    description: "",
    gameUrl: "/games/movers",
  },
  {
    id: "game_flyers",
    name: "FLYERS GAMES",
    status: "active",
    imgUrl: "",
    description: "",
    gameUrl: "/games/flyers",
  },
];

function GamesLibraryContent() {
  const activeBooks = gameBooks.filter((book) => book.status === "active");

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 sm:py-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center sm:mb-8 md:mb-12">
          <div className="mb-3 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/50 bg-white/75 px-4 py-3 shadow-lg backdrop-blur-md sm:mb-4 sm:gap-3 sm:px-5 sm:py-4 md:mb-4">
            <span className="text-2xl sm:text-3xl md:text-5xl">🎮</span>
            <h1 className="text-xl font-bold text-[#0E4BA9] drop-shadow-sm sm:text-2xl md:text-5xl">
              Thư viện Games WeWIN
            </h1>
            <span className="text-2xl sm:text-3xl md:text-5xl">🎯</span>
          </div>
          <p className="px-2 text-sm font-medium text-slate-800 drop-shadow-sm sm:text-base md:text-lg">
            Chọn cấp độ phù hợp để bắt đầu chơi và học tiếng Anh
          </p>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 sm:mt-4 sm:w-20 md:w-24" />
        </div>

        {/* Mobile + tablet: swipe carousel */}
        <LevelBooksCarousel books={activeBooks} />

        {/* Desktop lg+: 4-column grid */}
        <div className="hidden grid-cols-4 gap-7 lg:grid">
          {activeBooks.map((book) => (
            <GameCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}

const GamesPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <ForestPageShell showThemeSwitcher>
        <div className="min-h-screen bg-transparent px-4 py-12">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-lg font-medium text-gray-800">Đang tải...</p>
          </div>
        </div>
      </ForestPageShell>
    );
  }

  return (
    <ForestPageShell showThemeSwitcher>
      <GamesLibraryContent />
    </ForestPageShell>
  );
};

export default GamesPage;
