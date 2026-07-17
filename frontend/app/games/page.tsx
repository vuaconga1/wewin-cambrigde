"use client";

import React, { useState, useEffect } from "react";
import GameCard from "../components/books/GameCard";
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
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4 rounded-2xl border border-white/50 bg-white/75 px-5 py-4 shadow-lg backdrop-blur-md">
            <span className="text-3xl md:text-5xl">🎮</span>
            <h1 className="text-2xl md:text-5xl font-bold text-[#0E4BA9] drop-shadow-sm">
              Thư viện Games WeWIN
            </h1>
            <span className="text-3xl md:text-5xl">🎯</span>
          </div>
          <p className="text-slate-800 text-sm md:text-lg font-medium drop-shadow-sm px-2">
            Chọn cấp độ phù hợp để bắt đầu chơi và học tiếng Anh
          </p>
          <div className="mt-3 md:mt-4 h-1 w-20 md:w-24 bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
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
      <ForestPageShell>
        <div className="min-h-screen bg-transparent py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-800 text-lg font-medium">Đang tải...</p>
          </div>
        </div>
      </ForestPageShell>
    );
  }

  return (
    <ForestPageShell>
      <GamesLibraryContent />
    </ForestPageShell>
  );
};

export default GamesPage;
