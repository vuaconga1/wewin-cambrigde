"use client";

import { MonthlyLeaderboardPage } from "@/app/components/games/MonthlyLeaderboardPage";

export default function StartersMonthlyLeaderboardRoute() {
  return (
    <MonthlyLeaderboardPage
      bookType="starter"
      bookName="Kids Games"
      basePath="/games/starters"
    />
  );
}
