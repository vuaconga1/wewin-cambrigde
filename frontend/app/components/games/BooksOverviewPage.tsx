"use client";

import { useEffect, useMemo, useState } from "react";

import GameCard from "../books/GameCard";
import { gameService } from "@/services/game.service";
import type { UnitGameConfig } from "@/types/games";

type BookCard = {
  id: string;
  name: string;
  status: "active";
  imgUrl: string;
  description: string;
  gameUrl: string;
};

const BOOK_ROUTE_MAP: Record<string, { name: string; gameUrl: string; description: string }> = {
  kids: {
    name: "KIDS GAMES",
    gameUrl: "/games/kids",
    description: "Trò chơi học tiếng Anh dành cho trẻ mầm non",
  },
  starter: {
    name: "STARTERS GAMES",
    gameUrl: "/games/starters",
    description: "Trò chơi học tiếng Anh trình độ Starters",
  },
  mover: {
    name: "MOVERS GAMES",
    gameUrl: "/games/movers",
    description: "Trò chơi học tiếng Anh trình độ Movers",
  },
  flyer: {
    name: "FLYERS GAMES",
    gameUrl: "/games/flyers",
    description: "Trò chơi học tiếng Anh trình độ Flyers",
  },
};

function groupBooks(units: UnitGameConfig[]) {
  const grouped = new Map<string, UnitGameConfig[]>();

  units.forEach((unit) => {
    const bookType = unit.bookType ?? "unknown";
    const current = grouped.get(bookType) ?? [];
    current.push(unit);
    grouped.set(bookType, current);
  });

  return Array.from(grouped.entries()).map(([bookType, bookUnits]) => {
    const meta = BOOK_ROUTE_MAP[bookType];
    const firstUnit = bookUnits[0];

    return {
      id: `game_${bookType}`,
      name: meta?.name ?? `${bookType.toUpperCase()} GAMES`,
      status: "active" as const,
      imgUrl:
        "https://wewin.edu.vn/wp-content/uploads/2025/12/books-illustration-cartoon-books-books-vector.jpg",
      description: meta?.description ?? firstUnit?.bookname ?? "Trò chơi học tiếng Anh",
      gameUrl: meta?.gameUrl ?? `/games/${bookType}`,
    } satisfies BookCard;
  });
}

export function BooksOverviewPage() {
  const [mounted, setMounted] = useState(false);
  const [units, setUnits] = useState<UnitGameConfig[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadBooks = async () => {
      const loadedUnits = await gameService.getAllGames();
      if (!cancelled) {
        setUnits(loadedUnits);
      }
    };

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeBooks = useMemo(() => groupBooks(units), [units]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">🎮</span>
              <h1 className="text-5xl font-bold bg-linear-to-r from-[#0E4BA9] to-indigo-600 bg-clip-text text-transparent">
                Thư viện Games WeWIN
              </h1>
              <span className="text-5xl">🎯</span>
            </div>
            <p className="text-gray-600 text-lg">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <span className="text-3xl md:text-5xl">🎮</span>
            <h1 className="text-2xl md:text-5xl font-bold bg-linear-to-r from-[#0E4BA9] to-indigo-600 bg-clip-text text-transparent">
              Thư viện Games WeWIN
            </h1>
            <span className="text-3xl md:text-5xl">🎯</span>
          </div>
          <p className="text-gray-600 text-sm md:text-lg px-2">
            Chọn cấp độ phù hợp để bắt đầu chơi và học tiếng Anh
          </p>
          <div className="mt-3 md:mt-4 h-1 w-20 md:w-24 bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {activeBooks.map((book) => (
            <GameCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
