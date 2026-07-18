import type { ForestSeason } from "./themes";
import { FOREST_THEMES } from "./themes";

export type SidebarSeasonStyle = {
  headerBg: string;
  headerSubText: string;
  iconColor: string;
  itemTextActive: string;
  itemActiveBg: string;
  iconBoxActiveBg: string;
  toggleBtnBg: string;
  accent: string;
  icon: string;
};

const SIDEBAR_SEASON: Record<ForestSeason, Omit<SidebarSeasonStyle, "accent" | "icon">> = {
  spring: {
    headerBg: "bg-gradient-to-r from-[#0a1435] via-[#1a2a55] to-[#3d2a45]",
    headerSubText: "text-pink-200/85",
    iconColor: "text-pink-500",
    itemTextActive: "text-pink-700",
    itemActiveBg:
      "relative overflow-hidden bg-white border-l-4 border-[#FFB7C5] rounded-r-xl shadow-sm shadow-pink-200/40 scale-[1.01]",
    iconBoxActiveBg: "bg-[#FFB7C5] text-white shadow-md shadow-pink-300/30",
    toggleBtnBg: "bg-pink-500 hover:bg-pink-600 border-pink-300/40",
  },
  summer: {
    headerBg: "bg-gradient-to-r from-[#0a1435] via-[#153a5c] to-[#2a4a35]",
    headerSubText: "text-amber-200/85",
    iconColor: "text-amber-500",
    itemTextActive: "text-amber-700",
    itemActiveBg:
      "relative overflow-hidden bg-white border-l-4 border-[#FFC857] rounded-r-xl shadow-sm shadow-amber-200/40 scale-[1.01]",
    iconBoxActiveBg: "bg-[#FFC857] text-slate-800 shadow-md shadow-amber-300/30",
    toggleBtnBg: "bg-amber-500 hover:bg-amber-600 border-amber-300/40",
  },
  autumn: {
    headerBg: "bg-gradient-to-r from-[#0a1435] via-[#3a2818] to-[#5a3020]",
    headerSubText: "text-orange-200/85",
    iconColor: "text-orange-500",
    itemTextActive: "text-orange-700",
    itemActiveBg:
      "relative overflow-hidden bg-white border-l-4 border-[#E67E22] rounded-r-xl shadow-sm shadow-orange-200/40 scale-[1.01]",
    iconBoxActiveBg: "bg-[#E67E22] text-white shadow-md shadow-orange-300/30",
    toggleBtnBg: "bg-orange-500 hover:bg-orange-600 border-orange-300/40",
  },
  winter: {
    headerBg: "bg-gradient-to-r from-[#0a1435] via-[#1a3048] to-[#2a4058]",
    headerSubText: "text-sky-200/85",
    iconColor: "text-sky-500",
    itemTextActive: "text-sky-700",
    itemActiveBg:
      "relative overflow-hidden bg-white border-l-4 border-[#A8D8EA] rounded-r-xl shadow-sm shadow-sky-200/40 scale-[1.01]",
    iconBoxActiveBg: "bg-[#A8D8EA] text-slate-800 shadow-md shadow-sky-300/30",
    toggleBtnBg: "bg-sky-500 hover:bg-sky-600 border-sky-300/40",
  },
};

export function getSidebarSeasonStyle(season: ForestSeason): SidebarSeasonStyle {
  const base = SIDEBAR_SEASON[season];
  const config = FOREST_THEMES[season];
  return {
    ...base,
    accent: config.accent,
    icon: config.icon,
  };
}
