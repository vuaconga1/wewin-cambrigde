"use client";

import { MonthlyLeaderboardPage } from "@/app/components/games/MonthlyLeaderboardPage";

export default function MoversMonthlyLeaderboardRoute() {
  return (
    <MonthlyLeaderboardPage
      bookType="mover"
      bookName="Movers Games"
      basePath="/games/movers"
    />
  );
}
