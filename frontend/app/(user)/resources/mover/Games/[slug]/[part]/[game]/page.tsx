"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { UnitGameScreen } from "@/app/components/games/UnitGameScreen";
import { MoverUnitsSidebar } from "@/app/components/games/MoverUnitsSidebar";
import { gameService } from "@/services/game.service";
import type { UnitGameConfig } from "@/types/games";
import { Menu } from "lucide-react";

function getSavedPlayerId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("mover_book_player_id") || "";
}

export default function MoverGamePartGamePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [unit, setUnit] = useState<UnitGameConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      const data = await gameService.getGameBySlug(slug);
      setUnit(data);
      setLoading(false);
    };
    fetchUnit();
  }, [slug]);
  const router = useRouter();

  const [playerId, setPlayerId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return getSavedPlayerId() || "";
  });
  const [showIdModal, setShowIdModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return !getSavedPlayerId();
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const RELOAD_FLAG_KEY = "mover_book_was_reloaded";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeUnload = () => sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wasReload = sessionStorage.getItem(RELOAD_FLAG_KEY) === "1";
    if (wasReload) {
      localStorage.removeItem("mover_book_player_id");
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("mover_book_unit_") && key.endsWith("_progress")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      sessionStorage.removeItem(RELOAD_FLAG_KEY);
      const redirectAfterReload = async () => {
        const projects = await gameService.getGamesByType('mover');
        if (projects && projects.length > 0) {
          router.replace(`/resources/mover/Games/${projects[0].slug}`);
        } else {
          router.replace("/resources/mover/Games");
        }
      };
      redirectAfterReload();
      setPlayerId("");
      setShowIdModal(true);
      return;
    }
    // Đồng bộ playerId với localStorage
    const savedPlayerId = getSavedPlayerId();
    if (savedPlayerId) {
      // Có ID đã lưu → dùng ID đó, không hiện modal
      setPlayerId(savedPlayerId);
      setShowIdModal(false);
    } else {
      // Chưa có ID → hiện modal để nhập
      setPlayerId("");
      setShowIdModal(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SESSION_FLAG_KEY = "mover_book_session_started";
    if (!sessionStorage.getItem(SESSION_FLAG_KEY)) {
      sessionStorage.setItem(SESSION_FLAG_KEY, "1");
    }
  }, []);

  const handlePlayerIdSubmit = (id: string) => {
    setPlayerId(id);
    localStorage.setItem("mover_book_player_id", id);
    setShowIdModal(false);
  };

  const handlePlayerIdSkip = () => {
    setPlayerId("anonymous");
    localStorage.setItem("mover_book_player_id", "anonymous");
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
    <div className="min-h-screen md:flex md:items-stretch">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-24 left-3 z-30 md:hidden w-10 h-10 flex items-center justify-center bg-[#1057C1] hover:bg-[#0c3e8c] text-white rounded-lg shadow-lg transition-colors"
        aria-label="Mở menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <MoverUnitsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-0 md:min-h-screen">
        <UnitGameScreen
          unit={unit}
          heading={unit.name}
          subheading={unit.bookname}
          showBreadcrumb={true}
          breadcrumbBackUrl="/resources/mover/Games"
          breadcrumbBackLabel="Mover Book"
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
