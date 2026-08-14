"use client";

import { useCallback, useEffect, useId, useState } from "react";

export type MascotSide = "left" | "right";

/**
 * floating: chip nổi cạnh tiêu đề (màn chọn topic / chọn game).
 * inline: mascot dẫn truyện nằm trong panel game.
 */
export type MascotVariant = "floating" | "inline";

type MascotGuideProps = {
  side?: MascotSide;
  message?: string;
  /** Nhãn nhỏ phía trên lời thoại, dùng cho story của từng game. */
  title?: string;
  storageKey?: string;
  className?: string;
  variant?: MascotVariant;
  /** Tắt để mascot luôn dẫn truyện, không có nút OK. */
  dismissible?: boolean;
};

const MASCOT_SRC: Record<MascotSide, string> = {
  left: "/assets/mascot/mascot-side-left.png",
  right: "/assets/mascot/mascot-side-right.png",
};

const MASCOT_SIZE: Record<MascotVariant, { width: number; height: number }> = {
  floating: { width: 104, height: 128 },
  inline: { width: 76, height: 94 },
};

const DEFAULT_MESSAGE =
  "Chào em! Tớ là Hiệp sĩ WeWin. Tớ sẽ đồng hành và giúp em vượt qua mọi thử thách trong Vương quốc Tiếng Anh nhé!";

/** Guide chip — size locked via inline styles (globals.css sets img { height:auto }). */
export function MascotGuide({
  side = "left",
  message = DEFAULT_MESSAGE,
  title,
  storageKey = "wewin_mascot_part_select_dismissed",
  className = "",
  variant = "floating",
  dismissible = true,
}: MascotGuideProps) {
  const bubbleId = useId();
  const [visible, setVisible] = useState(!dismissible);
  const [entered, setEntered] = useState(!dismissible);

  useEffect(() => {
    if (!dismissible) return;
    try {
      if (localStorage.getItem(storageKey) === "1") return;
    } catch {
      // ignore
    }
    setVisible(true);
    const id = window.setTimeout(() => setEntered(true), 40);
    return () => window.clearTimeout(id);
  }, [storageKey, dismissible]);

  const dismiss = useCallback(() => {
    setEntered(false);
    window.setTimeout(() => {
      setVisible(false);
      try {
        localStorage.setItem(storageKey, "1");
      } catch {
        // ignore
      }
    }, 220);
  }, [storageKey]);

  if (!visible) return null;

  const isLeft = side === "left";
  const size = MASCOT_SIZE[variant];

  const mascotImage = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MASCOT_SRC[side]}
      alt="WeWin mascot"
      width={size.width}
      height={size.height}
      draggable={false}
      className="shrink-0 select-none drop-shadow-md"
      style={{
        width: size.width,
        height: size.height,
        maxWidth: size.width,
        maxHeight: size.height,
        objectFit: "contain",
      }}
    />
  );

  const dismissButton = dismissible ? (
    <button
      type="button"
      onClick={dismiss}
      className="mt-2 rounded-full bg-[#0E4BA9] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#0c3f8f]"
    >
      OK!
    </button>
  ) : null;

  if (variant === "inline") {
    return (
      <div
        className={`mb-4 flex items-end gap-2 sm:gap-3 md:mb-5 ${className}`}
        role="complementary"
        aria-labelledby={bubbleId}
      >
        {mascotImage}

        <div className="relative mb-1 min-w-0 flex-1">
          <div
            className="absolute -left-1 bottom-4 h-2.5 w-2.5 rotate-45 border border-amber-200/80 border-r-0 border-t-0 bg-white"
            aria-hidden
          />
          <div className="relative rounded-2xl border border-amber-200/90 bg-white/95 px-3 py-2.5 text-left shadow-md backdrop-blur-sm sm:px-4 sm:py-3">
            {title && (
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
                {title}
              </p>
            )}
            <p
              id={bubbleId}
              className="text-xs font-semibold leading-relaxed text-slate-800 sm:text-[13px]"
            >
              {message}
            </p>
            {dismissButton}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute top-0 z-30 hidden md:block ${
        isLeft ? "left-0 -translate-x-10 lg:-translate-x-14 xl:-translate-x-16" : "right-0 translate-x-3 lg:translate-x-6"
      } ${className}`}
      role="complementary"
      aria-labelledby={bubbleId}
    >
      <div
        className={`pointer-events-auto flex items-end gap-2.5 transition-all duration-300 ease-out ${
          isLeft ? "flex-row" : "flex-row-reverse"
        } ${entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        {mascotImage}

        <div className="relative mb-2 w-[200px] shrink-0 xl:w-[220px]">
          <div
            className={`absolute bottom-4 h-2.5 w-2.5 rotate-45 border border-amber-200/80 bg-white ${
              isLeft ? "-left-1 border-r-0 border-t-0" : "-right-1 border-b-0 border-l-0"
            }`}
            aria-hidden
          />
          <div className="relative rounded-2xl border border-amber-200/90 bg-white/95 px-3 py-2.5 text-left shadow-md backdrop-blur-sm">
            {title && (
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
                {title}
              </p>
            )}
            <p
              id={bubbleId}
              className="text-[12px] font-semibold leading-relaxed text-slate-800 xl:text-[13px]"
            >
              {message}
            </p>
            {dismissButton}
          </div>
        </div>
      </div>
    </div>
  );
}
