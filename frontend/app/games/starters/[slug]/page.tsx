"use client";

import { useState, useEffect, useCallback } from "react";
import { UnitGameScreen } from "@/app/components/games/UnitGameScreen";
import { StarterUnitsSidebar } from "@/app/components/games/StarterUnitsSidebar";
import { gameService } from "@/services/game.service";
import type { UnitGameConfig } from "@/types/games";
import { useParams, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useBookPlayerId } from "@/lib/games/useBookPlayerId";
import { ApiConnectionError } from "@/app/components/games/ApiConnectionError";

export default function StartersGameSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [unit, setUnit] = useState<UnitGameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onReloadClear = useCallback(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("starter_book_unit_") && key.endsWith("_progress")) {
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
    storageKey: "starter_book_player_id",
    reloadFlagKey: "starter_book_was_reloaded",
    onReloadClear,
  });

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const data = await gameService.getGameBySlug(slug);
        setUnit(data);
      } catch {
        setFetchError(true);
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

  if (fetchError) {
    return <ApiConnectionError />;
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

      <StarterUnitsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        basePath="/games/starters"
      />

      <div className="flex-1 md:ml-0">
        <UnitGameScreen
          unit={unit}
          heading={unit.name}
          subheading={unit.bookname}
          showBreadcrumb={true}
          breadcrumbBackUrl="/games/starters"
          breadcrumbBackLabel="Starters Games"
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
