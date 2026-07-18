"use client";

import { MonthlyLeaderboardPage } from "@/app/components/games/MonthlyLeaderboardPage";

export default function FlyersMonthlyLeaderboardRoute() {
  return (
    <MonthlyLeaderboardPage
      bookType="flyer"
      bookName="Flyers Games"
      basePath="/games/flyers"
    />
  );
}
