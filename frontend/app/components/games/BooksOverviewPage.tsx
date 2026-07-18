"use client";

import { useEffect, useMemo, useState } from "react";

import GameCard from "../books/GameCard";
import { gameService } from "@/services/game.service";
import type { UnitGameConfig } from "@/types/games";
import { ForestPageShell } from "@/app/components/games/forest-background";

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
      imgUrl: "",
      description: meta?.description ?? "",
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
    <ForestPageShell
      leaderboardMenu={[
        { label: "Kids Games", href: "/games/kids/leaderboard" },
        { label: "Starters Games", href: "/games/starters/leaderboard" },
        { label: "Movers Games", href: "/games/movers/leaderboard" },
        { label: "Flyers Games", href: "/games/flyers/leaderboard" },
      ]}
    >
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <div className="mb-3 md:mb-4">
            <h1 className="text-2xl font-bold text-[#0E4BA9] drop-shadow-[0_2px_8px_rgba(255,255,255,0.85)] md:text-5xl">
              Thư viện Games WeWIN
            </h1>
          </div>
          <p className="px-2 text-sm font-medium text-slate-800 drop-shadow-[0_1px_6px_rgba(255,255,255,0.8)] md:text-lg">
            Chọn cấp độ phù hợp để bắt đầu chơi và học tiếng Anh
          </p>
          <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 md:mt-4 md:w-24" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
          {activeBooks.map((book) => (
            <GameCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
    </ForestPageShell>
  );
}
