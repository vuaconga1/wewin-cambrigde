"use client";

import { usePathname } from "next/navigation";

import { AudioControls } from "./AudioControls";
import { isFullscreenGameRoute } from "@/lib/constants/routes";

/** Nút âm lượng cho trang không dùng ForestPageShell (management, login, …). */
export function GlobalAudioControls() {
  const pathname = usePathname();
  const isForestRoute = pathname.startsWith("/games");
  const isFullscreen = isFullscreenGameRoute(pathname);

  if (isForestRoute) return null;

  const position = isFullscreen
    ? "top-14 right-2 sm:right-3 md:top-3 md:right-4"
    : "top-20 right-2 sm:right-3 md:right-4";

  return (
    <div
      className={`pointer-events-none fixed z-[60] flex items-center justify-end ${position}`}
    >
      <div className="pointer-events-auto">
        <AudioControls compact />
      </div>
    </div>
  );
}
