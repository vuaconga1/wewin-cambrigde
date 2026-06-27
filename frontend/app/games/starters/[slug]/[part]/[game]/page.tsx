"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UnitGameScreen } from "@/app/components/games/UnitGameScreen";
import { gameService } from "@/services/game.service";
import { UnitGameConfig } from "@/types/games";
import { Menu } from "lucide-react";

function getSavedPlayerId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("starters_book_player_id") || "";
}

export default function GamePartGamePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [unit, setUnit] = useState<UnitGameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [playerId, setPlayerId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return getSavedPlayerId() || "";
  });
  const [showIdModal, setShowIdModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return !getSavedPlayerId();
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch game unit from API
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true);
        const gameUnit = await gameService.getGameBySlug(slug);
        if (gameUnit) {
          setUnit(gameUnit);
          setError(null);
        } else {
          setUnit(null);
          setError("Game không tìm thấy");
        }
      } catch (err) {
        setUnit(null);
        setError("Lỗi tải game data");
        console.error("Error fetching game:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [slug]);

  useEffect(() => {
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
    localStorage.setItem("starters_book_player_id", id);
    setShowIdModal(false);
  };

  const handlePlayerIdSkip = () => {
    setPlayerId("anonymous");
    localStorage.setItem("starters_book_player_id", "anonymous");
    setShowIdModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">Đang tải...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">{error}</h1>
          <p className="text-gray-500">Slug: {slug}</p>
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
        className="fixed top-24 left-3 z-30 md:hidden w-10 h-10 flex items-center justify-center bg-[#1057C1] hover:bg-[#0c3e8c] text-white rounded-lg shadow-lg transition-colors"
        aria-label="Mở menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1 md:ml-0 md:min-h-screen">
        <UnitGameScreen
          unit={unit}
          heading={unit.name}
          subheading={unit.bookname}
          showBreadcrumb={true}
          breadcrumbBackUrl="/games/starters"
          breadcrumbBackLabel=" Games"
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
