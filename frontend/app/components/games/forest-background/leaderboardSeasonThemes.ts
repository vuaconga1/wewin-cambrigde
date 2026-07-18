import type { ForestSeason } from "./themes";
import { FOREST_THEMES } from "./themes";

export type LeaderboardSeasonStyle = {
  icon: string;
  accent: string;
  heading: string;
  subtext: string;
  backBtn: string;
  monthBtn: string;
  monthLabel: string;
  panel: string;
  row: string;
  rankCircle: string;
  badge: string;
  score: string;
  star: string;
  footer: string;
  footerAccent: string;
  avatar: string;
  emptyIcon: string;
  decor: string[];
};

const STYLES: Record<ForestSeason, Omit<LeaderboardSeasonStyle, "icon" | "accent">> = {
  spring: {
    heading: "text-pink-800",
    subtext: "text-pink-900/70",
    backBtn:
      "border-pink-200/70 bg-white/85 text-pink-800 hover:bg-white shadow-pink-200/30",
    monthBtn:
      "border-pink-200/70 bg-white/85 text-pink-700 hover:bg-white shadow-pink-200/20",
    monthLabel: "text-pink-800",
    panel:
      "border-pink-200/60 bg-white/80 text-pink-900/80 shadow-pink-200/20",
    row: "border-pink-200/50 bg-white/90 shadow-pink-100/40",
    rankCircle: "bg-pink-100 text-pink-700",
    badge: "bg-pink-200 text-pink-900",
    score: "text-pink-900",
    star: "fill-pink-400 text-pink-400",
    footer: "bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600",
    footerAccent: "text-amber-200",
    avatar: "from-pink-200 to-rose-300 text-pink-900",
    emptyIcon: "🌸",
    decor: ["🌸", "💮", "🌺"],
  },
  summer: {
    heading: "text-amber-900",
    subtext: "text-amber-950/70",
    backBtn:
      "border-amber-200/70 bg-white/85 text-amber-900 hover:bg-white shadow-amber-200/30",
    monthBtn:
      "border-amber-200/70 bg-white/85 text-amber-800 hover:bg-white shadow-amber-200/20",
    monthLabel: "text-amber-900",
    panel:
      "border-amber-200/60 bg-white/80 text-amber-950/80 shadow-amber-200/20",
    row: "border-amber-200/50 bg-white/90 shadow-amber-100/40",
    rankCircle: "bg-amber-100 text-amber-800",
    badge: "bg-amber-300 text-amber-950",
    score: "text-amber-950",
    star: "fill-amber-400 text-amber-400",
    footer: "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500",
    footerAccent: "text-white",
    avatar: "from-amber-200 to-orange-300 text-amber-950",
    emptyIcon: "☀️",
    decor: ["☀️", "🌻", "✨"],
  },
  autumn: {
    heading: "text-orange-950",
    subtext: "text-orange-950/70",
    backBtn:
      "border-orange-200/70 bg-white/85 text-orange-900 hover:bg-white shadow-orange-200/30",
    monthBtn:
      "border-orange-200/70 bg-white/85 text-orange-800 hover:bg-white shadow-orange-200/20",
    monthLabel: "text-orange-950",
    panel:
      "border-orange-200/60 bg-[#FFF8F0]/88 text-orange-950/80 shadow-orange-200/20",
    row: "border-orange-200/50 bg-[#FFF8F0]/92 shadow-orange-100/40",
    rankCircle: "bg-orange-100 text-orange-800",
    badge: "bg-orange-300 text-orange-950",
    score: "text-orange-950",
    star: "fill-orange-500 text-orange-500",
    footer: "bg-gradient-to-r from-orange-600 via-amber-600 to-red-600",
    footerAccent: "text-amber-200",
    avatar: "from-orange-200 to-amber-400 text-orange-950",
    emptyIcon: "🍂",
    decor: ["🍂", "🍁", "🌾"],
  },
  winter: {
    heading: "text-sky-950",
    subtext: "text-sky-950/70",
    backBtn:
      "border-sky-200/70 bg-white/85 text-sky-900 hover:bg-white shadow-sky-200/30",
    monthBtn:
      "border-sky-200/70 bg-white/85 text-sky-800 hover:bg-white shadow-sky-200/20",
    monthLabel: "text-sky-950",
    panel:
      "border-sky-200/60 bg-[#F0F8FF]/88 text-sky-950/80 shadow-sky-200/20",
    row: "border-sky-200/50 bg-[#F0F8FF]/92 shadow-sky-100/40",
    rankCircle: "bg-sky-100 text-sky-800",
    badge: "bg-sky-200 text-sky-950",
    score: "text-sky-950",
    star: "fill-sky-400 text-sky-400",
    footer: "bg-gradient-to-r from-sky-600 via-indigo-500 to-blue-700",
    footerAccent: "text-amber-200",
    avatar: "from-sky-200 to-indigo-300 text-sky-950",
    emptyIcon: "❄️",
    decor: ["❄️", "⛄", "✨"],
  },
};

export function getLeaderboardSeasonStyle(
  season: ForestSeason,
): LeaderboardSeasonStyle {
  const config = FOREST_THEMES[season];
  return {
    ...STYLES[season],
    icon: config.icon,
    accent: config.accent,
  };
}
