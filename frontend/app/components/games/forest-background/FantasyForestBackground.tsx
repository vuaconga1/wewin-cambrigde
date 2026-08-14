"use client";

import Image from "next/image";

import "./forest-animations.css";

import type { ForestThemeConfig, ParticleKind } from "./themes";

type FantasyForestBackgroundProps = {
  config: ForestThemeConfig;
  reducedMotion?: boolean;
};

function ParticleLayer({
  kind,
  reducedMotion,
}: {
  kind: ParticleKind;
  reducedMotion: boolean;
}) {
  if (reducedMotion) return null;

  const count =
    kind === "snow"
      ? 16
      : kind === "fireflies" || kind === "sparkles"
        ? 10
        : kind === "leaves"
          ? 10
          : 8;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const left = ((i * 37) % 100) + (i % 5);
        const delay = (i * 0.7) % 8;
        const duration = 8 + (i % 6);
        const size =
          kind === "fireflies" || kind === "sparkles" ? 4 + (i % 3) : 7 + (i % 6);

        if (kind === "fireflies" || kind === "sparkles") {
          const sparkle = kind === "sparkles";
          return (
            <span
              key={i}
              className={`forest-firefly absolute rounded-full ${
                sparkle
                  ? "bg-amber-300/95 shadow-[0_0_8px_2px_rgba(212,175,55,0.65)]"
                  : "bg-lime-300/90 shadow-[0_0_8px_2px_rgba(170,255,0,0.6)]"
              }`}
              style={{
                left: `${left}%`,
                top: `${20 + (i * 13) % 55}%`,
                width: size,
                height: size,
                animationDelay: `${delay}s`,
                animationDuration: `${2 + (i % 3)}s`,
              }}
            />
          );
        }

        const color =
          kind === "petals"
            ? "bg-pink-300/70"
            : kind === "leaves"
              ? i % 2 === 0
                ? "bg-orange-400/75"
                : "bg-amber-500/70"
              : "bg-white/85";

        const shape =
          kind === "snow"
            ? "rounded-full"
            : kind === "leaves"
              ? "rounded-sm rotate-45"
              : "rounded-full";

        return (
          <span
            key={i}
            className={`forest-fall absolute ${color} ${shape}`}
            style={{
              left: `${left}%`,
              width: size,
              height: kind === "leaves" ? size * 0.6 : size,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export function FantasyForestBackground({
  config,
  reducedMotion = false,
}: FantasyForestBackgroundProps) {
  const hasScene = Boolean(config.scene);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: config.sky }}
      aria-hidden
    >
      {hasScene ? (
        <>
          {/* Full-scene wallpaper. Inline size beats globals.css `img { height:auto; max-width:100% }`
              which otherwise leaves a strip of sky/old layer visible at the bottom. */}
          <Image
            src={config.scene}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            data-forest-scene="true"
            className="transition-opacity duration-700"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              maxWidth: "none",
              maxHeight: "none",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />

          {/* Light center wash so game cards stay readable */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.12)_45%,transparent_72%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10" />

          <ParticleLayer kind={config.particle} reducedMotion={reducedMotion} />
        </>
      ) : null}
    </div>
  );
}
