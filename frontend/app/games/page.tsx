"use client";

import React, { useState, useEffect } from "react";
import GameCard from "../components/books/GameCard";
import { LevelBooksCarousel } from "../components/games/LevelBooksCarousel";
import { Book } from "../../lib/constants/types";
import { ForestPageShell } from "@/app/components/games/forest-background";
import { MascotGuide } from "@/app/components/games/MascotGuide";
import { LEVEL_LIBRARY_GUIDE } from "@/app/components/games/gameGuideContent";

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
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-transparent px-3 pb-6 pt-5 sm:px-5 sm:pt-6 lg:px-8 lg:pb-8 lg:pt-7">
      <div className="mx-auto flex w-full max-w-[1760px] flex-1 flex-col">
        <div className="mb-4 shrink-0 text-center sm:mb-5 lg:mb-6">
          <h1 className="text-xl font-bold text-[#0E4BA9] drop-shadow-[0_2px_8px_rgba(255,255,255,0.85)] sm:text-3xl lg:text-4xl xl:text-5xl">
            Thư viện Games WeWIN
          </h1>
          <p className="mt-1.5 px-2 text-sm font-medium text-slate-800 drop-shadow-[0_1px_6px_rgba(255,255,255,0.8)] sm:text-base lg:text-lg">
            Chọn cấp độ phù hợp để bắt đầu chơi và học tiếng Anh
          </p>
          <div className="mx-auto mt-2.5 h-1 w-16 rounded-full bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 sm:mt-3 sm:w-24" />
        </div>

        <MascotGuide
          variant="inline"
          side="left"
          dismissible={false}
          title={LEVEL_LIBRARY_GUIDE.title}
          message={LEVEL_LIBRARY_GUIDE.message}
          className="mx-auto w-full max-w-3xl shrink-0"
        />

        <div className="flex flex-1 flex-col justify-center">
          {/* Mobile + tablet: 1 main + 2 peeks */}
          <div className="lg:hidden">
            <LevelBooksCarousel books={activeBooks} />
          </div>

          {/* Desktop / Windows: 4-column grid như cũ */}
          <div className="hidden w-full grid-cols-4 items-center gap-2 lg:grid xl:gap-4 2xl:gap-5">
            {activeBooks.map((book) => (
              <GameCard key={book.id} book={book} />
            ))}
          </div>
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
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-transparent px-4">
          <p className="text-lg font-medium text-gray-800">Đang tải...</p>
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
