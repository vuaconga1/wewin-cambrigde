"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { UnitGameScreen } from "@/app/components/games/UnitGameScreen";
import { MoverUnitsSidebar } from "@/app/components/games/MoverUnitsSidebar";
import { gameService } from "@/services/game.service";
import type { UnitGameConfig } from "@/types/games";
import { Menu } from "lucide-react";
import { useBookPlayerId } from "@/lib/games/useBookPlayerId";

export default function MoversGameSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [unit, setUnit] = useState<UnitGameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onReloadClear = useCallback(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("mover_book_unit_") && key.endsWith("_progress")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }, []);

  const {
    playerId,
    showIdModal,
    handlePlayerIdSubmit,
    handlePlayerIdSkip,
  } = useBookPlayerId({
    storageKey: "mover_book_player_id",
    reloadFlagKey: "mover_book_was_reloaded",
    onReloadClear,
  });

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      const data = await gameService.getGameBySlug(slug);
      setUnit(data);
      setLoading(false);
    };
    void fetchUnit();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-blue-900 font-semibold">
          Đang tải...
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            Project không tìm thấy
          </h1>
          <p className="text-gray-500">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:flex md:items-stretch">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-24 left-3 z-30 md:hidden w-10 h-10 flex items-center justify-center bg-[#1057C1] hover:bg-[#0c3e8c] text-white rounded-lg shadow-lg transition-colors"
        aria-label="Mở menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <MoverUnitsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        basePath="/games/movers"
      />

      <div className="flex-1 md:ml-0">
        <UnitGameScreen
          unit={unit}
          heading={unit.name}
          subheading={unit.bookname}
          showBreadcrumb={true}
          breadcrumbBackUrl="/games/movers"
          breadcrumbBackLabel="Movers Games"
          initialPlayerId={playerId || ""}
          showIdModal={showIdModal}
          onPlayerIdSubmit={handlePlayerIdSubmit}
          onPlayerIdSkip={handlePlayerIdSkip}
          unitIndex={0}
        />
      </div>
    </div>
  );
}
