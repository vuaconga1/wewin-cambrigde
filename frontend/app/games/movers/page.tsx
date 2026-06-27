"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { gameService } from "@/services/game.service";
import { ApiConnectionError } from "@/app/components/games/ApiConnectionError";

export default function MoversGamesPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadProjectsAndRedirect = async () => {
      try {
        const projects = await gameService.getGamesByType("mover");
        if (!projects?.length) {
          setError(true);
          return;
        }
        router.replace(`/games/movers/${projects[0].slug}`);
      } catch {
        setError(true);
      }
    };
    void loadProjectsAndRedirect();
  }, [router]);

  if (error) {
    return <ApiConnectionError />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 text-green-600 font-semibold">
      <div className="text-center">
        <div className="text-4xl mb-4">🎮</div>
        <div>Đang mở Movers Games...</div>
      </div>
    </div>
  );
}
