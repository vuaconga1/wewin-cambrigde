"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UnitGameScreen } from "@/app/components/games/UnitGameScreen";
import { BookUnitsSidebar } from "@/app/components/games/BookUnitsSidebar";
import { ApiConnectionError } from "@/app/components/games/ApiConnectionError";
import { ApiWakingLoader } from "@/app/components/games/ApiWakingLoader";
import { gameService } from "@/services/game.service";
import { useBookPlayerId } from "@/lib/games/useBookPlayerId";
import { BOOK_PLAYER_STORAGE_KEY } from "@/lib/games/bookRoutes";

import type { UnitGameConfig } from "@/types/games";

export const SUPER_KIDS_BASE_PATH = "/games/super-kids";

/** Màn unit Super Kids, dùng chung cho các route [slug], [slug]/[part], [slug]/[part]/[game]. */
export function SuperKidsUnitPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [unit, setUnit] = useState<UnitGameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { playerId, showIdModal, handlePlayerIdSubmit, handlePlayerIdSkip } =
    useBookPlayerId({
      storageKey: BOOK_PLAYER_STORAGE_KEY["super-kids"],
      reloadFlagKey: "super_kids_book_was_reloaded",
    });

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        setUnit(await gameService.getGameBySlug(slug));
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
    return <ApiWakingLoader label="Đang tải unit…" />;
  }

  if (fetchError) {
    return <ApiConnectionError />;
  }

  if (!unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Unit không tìm thấy</h1>
          <p className="text-gray-500">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:flex md:items-stretch">
      <BookUnitsSidebar
        bookType="super-kids"
        bookName="Super Kids"
        basePath={SUPER_KIDS_BASE_PATH}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 md:ml-0 md:min-h-screen">
        <UnitGameScreen
          onOpenUnitsSidebar={() => setSidebarOpen(true)}
          unit={unit}
          heading={unit.name}
          subheading={unit.bookname}
          showBreadcrumb={true}
          breadcrumbBackUrl={SUPER_KIDS_BASE_PATH}
          breadcrumbBackLabel="Super Kids"
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
