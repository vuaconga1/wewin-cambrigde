"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gameService } from "@/services/game.service";
import { ApiConnectionError } from "@/app/components/games/ApiConnectionError";
import { ApiWakingLoader } from "@/app/components/games/ApiWakingLoader";

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

  return <ApiWakingLoader label="Đang mở Kids Games…" />;
}
