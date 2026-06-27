"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { gameService } from "@/services/game.service";

export default function FlyerBookGamesPage() {
  const router = useRouter();

  useEffect(() => {
    const loadProjectsAndRedirect = async () => {
      const projects = await gameService.getGamesByType('flyer');
      if (!projects || projects.length === 0) return;
      const first = projects[0];
      router.replace(`/resources/flyer/Games/${first.slug}`);
    };
    loadProjectsAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 text-blue-600 font-semibold">
      Đang mở Flyer Book...
    </div>
  );
}

