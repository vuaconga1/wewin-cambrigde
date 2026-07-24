export type ForestSeason = "spring" | "summer" | "autumn" | "winter" | "wewin";

export type ParticleKind = "petals" | "fireflies" | "leaves" | "snow" | "sparkles";

export type ForestThemeConfig = {
  id: ForestSeason;
  label: string;
  icon: string;
  /** Full-screen illustrated scene (opaque, edge-to-edge) */
  scene: string;
  /** Fallback gradient while image loads */
  sky: string;
  accent: string;
  particle: ParticleKind;
};

const ASSET_BASE = "/assets/forest-background";

export const FOREST_STORAGE_KEY = "wewin_forest_theme";

export const FOREST_SEASONS: ForestSeason[] = [
  "spring",
  "summer",
  "autumn",
  "winter",
  "wewin",
];

export const FOREST_THEMES: Record<ForestSeason, ForestThemeConfig> = {
  spring: {
    id: "spring",
    label: "Xuân",
    icon: "🌸",
    scene: `${ASSET_BASE}/scene-spring.png`,
    sky: "linear-gradient(180deg, #dff3ff 0%, #ffe8f2 50%, #e8f7e4 100%)",
    accent: "#FFB7C5",
    particle: "petals",
  },
  summer: {
    id: "summer",
    label: "Hạ",
    icon: "☀️",
    scene: `${ASSET_BASE}/scene-summer.png`,
    sky: "linear-gradient(180deg, #7ec8f0 0%, #b8e6ff 50%, #d4f5d8 100%)",
    accent: "#FFC857",
    particle: "fireflies",
  },
  autumn: {
    id: "autumn",
    label: "Thu",
    icon: "🍂",
    scene: `${ASSET_BASE}/scene-autumn.png`,
    sky: "linear-gradient(180deg, #ffecd2 0%, #fcb69f 50%, #c9a66b 100%)",
    accent: "#E67E22",
    particle: "leaves",
  },
  winter: {
    id: "winter",
    label: "Đông",
    icon: "❄️",
    scene: `${ASSET_BASE}/scene-winter.png`,
    sky: "linear-gradient(180deg, #1a2744 0%, #4a6fa5 50%, #e8eef5 100%)",
    accent: "#A8D8EA",
    particle: "snow",
  },
  wewin: {
    id: "wewin",
    label: "WeWin",
    icon: "🏆",
    scene: `${ASSET_BASE}/scene-wewin.png`,
    sky: "linear-gradient(180deg, #7ec8f0 0%, #b8e6ff 45%, #c8e8a8 100%)",
    accent: "#D4AF37",
    particle: "sparkles",
  },
};

export function isForestSeason(value: unknown): value is ForestSeason {
  return (
    typeof value === "string" &&
    FOREST_SEASONS.includes(value as ForestSeason)
  );
}
