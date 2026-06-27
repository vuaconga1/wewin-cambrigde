"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gameService } from "@/services/game.service";
import { ApiConnectionError } from "@/app/components/games/ApiConnectionError";

export default function KidsGamesPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadProjectsAndRedirect = async () => {
      try {
        const projectsForSidebar = await gameService.getGamesByType("kids");
        if (!projectsForSidebar?.length) {
          setError(true);
          return;
        }
        router.replace(`/games/kids/${projectsForSidebar[0].slug}`);
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 to-rose-100 text-pink-600 font-semibold">
      <div className="text-center">
        <div className="text-4xl mb-4">🎮</div>
        <div>Đang mở Kids Games...</div>
      </div>
    </div>
  );
}
