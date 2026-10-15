"use client";

import { usePathname } from "next/navigation";

import { AudioControls } from "./AudioControls";
import { isFullscreenGameRoute } from "@/lib/constants/routes";

/** Nút âm lượng cho trang không dùng ForestPageShell (management, login, …). */
export function GlobalAudioControls() {
  const pathname = usePathname();
  // `/` = thư viện games (re-export từ /games) — ForestPageShell đã có AudioControls
  const usesForestShell =
    pathname === "/" ||
    pathname.startsWith("/games") ||
    isFullscreenGameRoute(pathname);

  if (usesForestShell) return null;

  return (
    <div className="pointer-events-none fixed top-20 right-2 z-[60] flex items-center justify-end sm:right-3 md:right-4">
      <div className="pointer-events-auto">
        <AudioControls compact />
      </div>
    </div>
  );
}
