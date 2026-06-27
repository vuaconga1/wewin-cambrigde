"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { UnitGameScreen } from "@/app/components/games/UnitGameScreen";
import { KidsUnitsSidebar } from "@/app/components/games/KidsUnitsSidebar";
import { gameService } from "@/services/game.service";
import { Menu } from "lucide-react";
import type { UnitGameConfig } from "@/types/games";

function getSavedPlayerId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("kids_book_player_id") || "";
}

export default function KidsGamePartPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [unit, setUnit] = useState<UnitGameConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [playerId, setPlayerId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return getSavedPlayerId() || "";
  });
  const [showIdModal, setShowIdModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return !getSavedPlayerId();
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      const data = await gameService.getGameBySlug(slug);
      setUnit(data);
      setLoading(false);
    };
    fetchUnit();
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPlayerId = getSavedPlayerId();
    if (savedPlayerId !== playerId) {
      setPlayerId(savedPlayerId);
      setShowIdModal(false);
    } else if (!savedPlayerId && playerId) {
      setPlayerId("");
      setShowIdModal(true);
    }
  }, [playerId]);

  const handlePlayerIdSubmit = (id: string) => {
    setPlayerId(id);
    localStorage.setItem("kids_book_player_id", id);
    setShowIdModal(false);
  };

  const handlePlayerIdSkip = () => {
    setPlayerId("anonymous");
    localStorage.setItem("kids_book_player_id", "anonymous");
    setShowIdModal(false);
  };

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
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Project không tìm thấy</h1>
          <p className="text-gray-500">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:flex md:items-stretch bg-gradient-to-b from-blue-50 via-blue-50 to-blue-100 bg-fixed">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3 left-3 z-30 md:hidden w-10 h-10 flex items-center justify-center bg-[#1057C1] hover:bg-[#0c3e8c] text-white rounded-lg shadow-lg transition-colors"
        aria-label="Mở menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <KidsUnitsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} basePath="/games/kids" />

      <div className="flex-1 md:ml-0 md:min-h-screen">
        <UnitGameScreen
          unit={unit}
          heading={unit.name}
          subheading={unit.bookname}
          showBreadcrumb={true}
          breadcrumbBackUrl="/games/kids"
          breadcrumbBackLabel="Kids Games"
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

