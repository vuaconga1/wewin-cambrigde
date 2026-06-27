"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { gameService } from "@/services/game.service";

export default function StarterBookGamesPage() {
  const router = useRouter();
  useEffect(() => {
    const loadProjectsAndRedirect = async () => {
      const projectsForSidebar = await gameService.getGamesByType('starter');
      if (!projectsForSidebar || projectsForSidebar.length === 0) return;

      const firstProject = projectsForSidebar[0];
      router.replace(`/resources/starters/Games/${firstProject.slug}`);
    };

    loadProjectsAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50 text-cyan-600 font-semibold">
      Đang mở Starter Book...
    </div>
  );
}

