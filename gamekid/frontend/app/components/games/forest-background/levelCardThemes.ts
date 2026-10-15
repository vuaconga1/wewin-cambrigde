import type { ForestSeason } from "./themes";

export type LevelKey = "kids" | "starters" | "movers" | "flyers";

export type LevelCardPalette = {
  topBg: string;
  bottomBg: string;
  iconBg: string;
  ring: string;
  titleColor: string;
  subtitleColor: string;
};

type StoredPalette = Omit<LevelCardPalette, "iconBg">;

/** Màu thẻ cấp độ — pastel hòa với từng scene mùa */
const SEASON_LEVEL_PALETTES: Record<
  ForestSeason,
  Record<LevelKey, StoredPalette>
> = {
  spring: {
    kids: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f7f2f5 100%)",
      bottomBg: "linear-gradient(145deg, #ffe0ec 0%, #f5b8cc 55%, #e8a0b8 100%)",
      ring: "ring-[#f5c6d6]/70 hover:ring-[#f0b0c8]",
      titleColor: "#6b3d52",
      subtitleColor: "#8a5568",
    },
    starters: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f2f7fb 100%)",
      bottomBg: "linear-gradient(145deg, #d8ecff 0%, #a8d4f0 55%, #88bce0 100%)",
      ring: "ring-[#b8d8f0]/70 hover:ring-[#98c8e8]",
      titleColor: "#2e5570",
      subtitleColor: "#4a7088",
    },
    movers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f2f8f2 100%)",
      bottomBg: "linear-gradient(145deg, #d4efd4 0%, #a8d8a8 55%, #88c088 100%)",
      ring: "ring-[#b8e0b8]/70 hover:ring-[#98d098]",
      titleColor: "#2d5c38",
      subtitleColor: "#4a7550",
    },
    flyers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f5f2f8 100%)",
      bottomBg: "linear-gradient(145deg, #e8dff5 0%, #c8b8e0 55%, #b0a0d0 100%)",
      ring: "ring-[#d0c0e8]/70 hover:ring-[#b8a8d8]",
      titleColor: "#4a3d68",
      subtitleColor: "#625878",
    },
  },
  summer: {
    kids: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #faf8f2 100%)",
      bottomBg: "linear-gradient(145deg, #fff0c8 0%, #f5d888 55%, #e8c060 100%)",
      ring: "ring-[#f5e0a0]/70 hover:ring-[#f0d080]",
      titleColor: "#6b5020",
      subtitleColor: "#887038",
    },
    starters: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f0f8fc 100%)",
      bottomBg: "linear-gradient(145deg, #b8e8ff 0%, #78cce8 55%, #58b8d8 100%)",
      ring: "ring-[#98d8f0]/70 hover:ring-[#78c8e8]",
      titleColor: "#1e5878",
      subtitleColor: "#387090",
    },
    movers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f2faf4 100%)",
      bottomBg: "linear-gradient(145deg, #c0f0d0 0%, #78d898 55%, #58c078 100%)",
      ring: "ring-[#98e8b0]/70 hover:ring-[#78d898]",
      titleColor: "#1e6038",
      subtitleColor: "#387850",
    },
    flyers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #faf6f0 100%)",
      bottomBg: "linear-gradient(145deg, #ffe8c0 0%, #f0c078 55%, #e0a858 100%)",
      ring: "ring-[#f5d898]/70 hover:ring-[#f0c878]",
      titleColor: "#784818",
      subtitleColor: "#906030",
    },
  },
  autumn: {
    kids: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #faf6f2 100%)",
      bottomBg: "linear-gradient(145deg, #f5dcc0 0%, #e0b888 55%, #c89868 100%)",
      ring: "ring-[#e8c8a0]/70 hover:ring-[#d8b888]",
      titleColor: "#5c4028",
      subtitleColor: "#785838",
    },
    starters: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #faf8f0 100%)",
      bottomBg: "linear-gradient(145deg, #f5e8b0 0%, #e0c868 55%, #c8a848 100%)",
      ring: "ring-[#e8d888]/70 hover:ring-[#d8c868]",
      titleColor: "#5c4820",
      subtitleColor: "#786030",
    },
    movers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f5f8f0 100%)",
      bottomBg: "linear-gradient(145deg, #d8e8b8 0%, #a8c878 55%, #88a858 100%)",
      ring: "ring-[#c8d898]/70 hover:ring-[#b8c878]",
      titleColor: "#3d5028",
      subtitleColor: "#586838",
    },
    flyers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #faf4f2 100%)",
      bottomBg: "linear-gradient(145deg, #f0c8b0 0%, #d89878 55%, #c07858 100%)",
      ring: "ring-[#e8b8a0]/70 hover:ring-[#d8a088]",
      titleColor: "#5c3828",
      subtitleColor: "#785040",
    },
  },
  winter: {
    kids: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f4f2f8 100%)",
      bottomBg: "linear-gradient(145deg, #e8dff5 0%, #c8b8e0 55%, #a898c8 100%)",
      ring: "ring-[#d0c0e8]/70 hover:ring-[#b8a8d8]",
      titleColor: "#4a3868",
      subtitleColor: "#625880",
    },
    starters: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f0f5fa 100%)",
      bottomBg: "linear-gradient(145deg, #c8dff5 0%, #98c0e0 55%, #78a8d0 100%)",
      ring: "ring-[#b0d0e8]/70 hover:ring-[#98c0d8]",
      titleColor: "#284868",
      subtitleColor: "#406080",
    },
    movers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f2f8f5 100%)",
      bottomBg: "linear-gradient(145deg, #b8d8c8 0%, #88b8a0 55%, #689880 100%)",
      ring: "ring-[#98c8b0]/70 hover:ring-[#88b8a0]",
      titleColor: "#284838",
      subtitleColor: "#406050",
    },
    flyers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f2f6fa 100%)",
      bottomBg: "linear-gradient(145deg, #d0e0f0 0%, #a0c0d8 55%, #80a8c8 100%)",
      ring: "ring-[#b0c8e0]/70 hover:ring-[#98b8d0]",
      titleColor: "#304858",
      subtitleColor: "#486070",
    },
  },
  wewin: {
    kids: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f7f4eb 100%)",
      bottomBg: "linear-gradient(145deg, #f5e6b8 0%, #d4af37 55%, #b68d4c 100%)",
      ring: "ring-[#D4AF37]/70 hover:ring-[#E5C38B]",
      titleColor: "#000B29",
      subtitleColor: "#3d4a6b",
    },
    starters: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #eef2fb 100%)",
      bottomBg: "linear-gradient(145deg, #a8c4f0 0%, #1e40af 55%, #000B29 100%)",
      ring: "ring-[#1e40af]/50 hover:ring-[#D4AF37]",
      titleColor: "#000B29",
      subtitleColor: "#3d4a6b",
    },
    movers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f0f7f2 100%)",
      bottomBg: "linear-gradient(145deg, #b8e0c0 0%, #3d8b5a 55%, #1e5c3a 100%)",
      ring: "ring-[#3d8b5a]/50 hover:ring-[#D4AF37]",
      titleColor: "#000B29",
      subtitleColor: "#3d5a48",
    },
    flyers: {
      topBg: "linear-gradient(180deg, #ffffff 0%, #f5f0e8 100%)",
      bottomBg: "linear-gradient(145deg, #e5c38b 0%, #1e40af 50%, #000B29 100%)",
      ring: "ring-[#D4AF37]/60 hover:ring-[#1e40af]",
      titleColor: "#000B29",
      subtitleColor: "#3d4a6b",
    },
  },
};

const BOOK_ID_TO_LEVEL: Record<string, LevelKey> = {
  game_kids: "kids",
  game_starters: "starters",
  game_starter: "starters",
  game_movers: "movers",
  game_mover: "movers",
  game_flyers: "flyers",
  game_flyer: "flyers",
};

export function resolveLevelKey(bookId: string): LevelKey {
  return BOOK_ID_TO_LEVEL[bookId] ?? "starters";
}

export function getLevelCardPalette(
  season: ForestSeason,
  level: LevelKey,
): LevelCardPalette {
  const palette = SEASON_LEVEL_PALETTES[season][level];
  return {
    ...palette,
    iconBg: palette.bottomBg,
  };
}
