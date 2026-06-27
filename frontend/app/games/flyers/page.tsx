"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gameService } from "@/services/game.service";
import { ApiConnectionError } from "@/app/components/games/ApiConnectionError";

export default function FlyersGamesPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadProjectsAndRedirect = async () => {
      try {
        const projects = await gameService.getGamesByType("flyer");
        if (!projects?.length) {
          setError(true);
          return;
        }
        router.replace(`/games/flyers/${projects[0].slug}`);
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
    <div className="min-h-screen flex items-center justify-center bg-blue-50 text-blue-600 font-semibold">
      <div className="text-center">
        <div className="text-4xl mb-4">🎮</div>
        <div>Đang mở Flyers Games...</div>
      </div>
    </div>
  );
}
