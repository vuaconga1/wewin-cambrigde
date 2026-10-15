import type { GameKey, UnitGameConfig, UnitGamePart } from "@/types/games";

export const FULL_GAME_KEYS: GameKey[] = [
  "flip",
  "speak",
  "memory",
  "ordering",
  "scramble",
];

function normalizePart(part: UnitGamePart): UnitGamePart {
  return {
    ...part,
    enabledGames: [...FULL_GAME_KEYS],
  };
}

export function normalizeUnitGameConfig<T extends UnitGameConfig>(config: T): T {
  return {
    ...config,
    enabledGames: [...FULL_GAME_KEYS],
    parts: config.parts?.map(normalizePart),
  } as T;
}

export function normalizeUnitGameConfigs<T extends UnitGameConfig>(configs: T[]): T[] {
  return configs.map((config) => normalizeUnitGameConfig(config));
}