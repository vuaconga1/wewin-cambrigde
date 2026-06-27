"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { gameService } from "@/services/game.service";

export default function MoverBookGamesPage() {
  const router = useRouter();
  useEffect(() => {
    const loadProjectsAndRedirect = async () => {
      const projectsForSidebar = await gameService.getGamesByType('mover');
      if (!projectsForSidebar || projectsForSidebar.length === 0) return;

      const firstProject = projectsForSidebar[0];
      router.replace(`/resources/mover/Games/${firstProject.slug}`);
    };

    loadProjectsAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 text-green-600 font-semibold">
      Đang mở Mover Book...
    </div>
  );
}

