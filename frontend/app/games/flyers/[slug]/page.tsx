"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { UnitGameScreen } from "@/app/components/games/UnitGameScreen";
import { FlyerUnitsSidebar } from "@/app/components/games/FlyerUnitsSidebar";
import { gameService } from "@/services/game.service";
import type { UnitGameConfig } from "@/types/games";
import { useBookPlayerId } from "@/lib/games/useBookPlayerId";

export default function FlyersGameSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [unit, setUnit] = useState<UnitGameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onReloadClear = useCallback(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("flyer_book_unit_") && key.endsWith("_progress")) {
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
    storageKey: "flyer_book_player_id",
    reloadFlagKey: "flyer_book_was_reloaded",
    onReloadClear,
  });

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      try {
        const data = await gameService.getGameBySlug(slug);
        setUnit(data);
      } catch {
        setUnit(null);
      } finally {
        setLoading(false);
      }
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
    <div className="min-h-screen md:flex md:items-stretch bg-gradient-to-b from-blue-50 via-blue-50 to-blue-100 bg-fixed">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-24 left-3 z-30 md:hidden w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
        aria-label="Mở menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <FlyerUnitsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        basePath="/games/flyers"
      />

      <div className="flex-1 md:ml-0 md:min-h-screen">
        <UnitGameScreen
          unit={unit}
          heading={unit.name}
          subheading={unit.bookname}
          showBreadcrumb={true}
          breadcrumbBackUrl="/games/flyers"
          breadcrumbBackLabel="Flyers Games"
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
