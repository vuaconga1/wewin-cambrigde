"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { gameService } from "@/services/game.service";
import { ApiConnectionError } from "@/app/components/games/ApiConnectionError";
import { ApiWakingLoader } from "@/app/components/games/ApiWakingLoader";

export default function StartersGamesPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadProjectsAndRedirect = async () => {
      try {
        const projects = await gameService.getGamesByType("starter");
        if (!projects?.length) {
          setError(true);
          return;
        }
        router.replace(`/games/starters/${projects[0].slug}`);
      } catch {
        setError(true);
      }
    };
    void loadProjectsAndRedirect();
  }, [router]);

  if (error) {
    return <ApiConnectionError />;
  }

  return <ApiWakingLoader label="Đang mở Starters Games…" />;
}
