"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gameService } from "@/services/game.service";
import { ApiConnectionError } from "@/app/components/games/ApiConnectionError";
import { ApiWakingLoader } from "@/app/components/games/ApiWakingLoader";

export default function SuperKidsGamesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "empty" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    gameService
      .getGamesByType("super-kids")
      .then((units) => {
        if (cancelled) return;
        if (units.length > 0) {
          router.replace(`/games/super-kids/${units[0].slug}`);
        } else {
          setStatus("empty");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "error") return <ApiConnectionError />;

  if (status === "empty") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-gray-700">Super Kids đang được cập nhật.</p>
      </div>
    );
  }

  return <ApiWakingLoader label="Đang tải Super Kids…" />;
}
