"use client";

import { useState, useEffect } from "react";
import { UnitGameScreen } from "@/app/components/games/UnitGameScreen";
import { KidsUnitsSidebar } from "@/app/components/games/KidsUnitsSidebar";
import { gameService } from "@/services/game.service";
import { useParams, useRouter } from "next/navigation";

import type { UnitGameConfig } from "@/types/games";

// Helper: lấy ID từ localStorage (chỉ dùng trong cùng 1 phiên tab)
function getSavedPlayerId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("kids_book_player_id") || "";
}

export default function ProjectGamePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [unit, setUnit] = useState<UnitGameConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Load playerId ngay lập tức để tránh flash "Đang tải dữ liệu..."
  const [playerId, setPlayerId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return getSavedPlayerId() || "";
  });
  const [showIdModal, setShowIdModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return !getSavedPlayerId();
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const RELOAD_FLAG_KEY = "kids_book_was_reloaded";

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      const data = await gameService.getGameBySlug(slug);
      setUnit(data);
      setLoading(false);
    };
    fetchUnit();
  }, [slug]);

  // Đánh dấu khi tab chuẩn bị reload/đóng
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = () => {
      sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Đọc localStorage sau khi mount
  // - Nếu trước đó có reload (F5) → xoá ID + progress, bắt nhập lại
  // - Nếu chỉ navigate trong cùng tab → giữ ID + progress
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SESSION_FLAG_KEY = "kids_book_session_started";

    // Nếu trước đó có reload (F5) → clear ID + progress và quay về Project đầu tiên
    const wasReload = sessionStorage.getItem(RELOAD_FLAG_KEY) === "1";
    if (wasReload) {
      localStorage.removeItem("kids_book_player_id");

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("unit_") && key.endsWith("_progress")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear flag reload cho lần sau
      sessionStorage.removeItem(RELOAD_FLAG_KEY);

      // Lấy project đầu tiên và chuyển hướng về đó
      const redirectAfterReload = async () => {
        const projects = await gameService.getGamesByType('kids');
        if (projects && projects.length > 0) {
          router.replace(`/resources/kids/Games/${projects[0].slug}`);
        } else {
          router.replace("/resources/kids/Games");
        }
      };
      redirectAfterReload();

      return;
    }

    // Lần đầu vào Kids Games trong tab này → đánh dấu đã khởi tạo session
    if (!sessionStorage.getItem(SESSION_FLAG_KEY)) {
      sessionStorage.setItem(SESSION_FLAG_KEY, "1");
    }

    // Đồng bộ playerId với localStorage (nếu có thay đổi từ bên ngoài)
    const savedPlayerId = getSavedPlayerId();
    if (savedPlayerId !== playerId) {
      setPlayerId(savedPlayerId);
      setShowIdModal(false);
    } else if (!savedPlayerId && playerId) {
      // Nếu localStorage không có nhưng state có, có thể đã bị xóa
      setPlayerId("");
      setShowIdModal(true);
    }
  }, [router, playerId]);

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
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            Project không tìm thấy
          </h1>
          <p className="text-gray-500">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  // Không cần check playerId === null nữa vì đã load ngay từ đầu

  return (
    <div className="min-h-screen md:flex md:items-stretch ">
      {/* Hamburger button cho mobile */}
{/* Sidebar */}
      <KidsUnitsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        basePath="/resources/kids/Games"
      />

      <div className="flex-1 md:ml-0 md:min-h-screen">
        <UnitGameScreen
          onOpenUnitsSidebar={() => setSidebarOpen(true)}
          unit={unit}
          heading={unit.name}
          subheading={unit.bookname}
          showBreadcrumb={true}
          breadcrumbBackUrl="/resources/kids/Games"
          breadcrumbBackLabel="Kids Book"
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

