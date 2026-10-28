"use client";

import { MonthlyLeaderboardPage } from "@/app/components/games/MonthlyLeaderboardPage";

export default function SuperKidsMonthlyLeaderboardRoute() {
  return (
    <MonthlyLeaderboardPage
      bookType="super-kids"
      bookName="Super Kids"
      basePath="/games/super-kids"
    />
  );
}
