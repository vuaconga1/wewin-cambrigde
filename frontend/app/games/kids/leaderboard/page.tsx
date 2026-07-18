"use client";

import { MonthlyLeaderboardPage } from "@/app/components/games/MonthlyLeaderboardPage";

export default function KidsMonthlyLeaderboardRoute() {
  return (
    <MonthlyLeaderboardPage
      bookType="kids"
      bookName="Kids Games"
      basePath="/games/kids"
    />
  );
}
