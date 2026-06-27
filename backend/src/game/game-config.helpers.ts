const FULL_GAME_KEYS = [
  'flip',
  'speak',
  'memory',
  'ordering',
  'scramble',
] as const;

type GamePartLike = {
  enabledGames?: string[];
};

type GameUnitLike = {
  enabledGames?: string[];
  parts?: GamePartLike[];
};

export function normalizeGameUnit<T extends GameUnitLike>(unit: T): T {
  const parts = unit.parts?.map((part) => ({
    ...part,
    enabledGames: [...FULL_GAME_KEYS],
  }));

  return {
    ...unit,
    enabledGames: [...FULL_GAME_KEYS],
    ...(unit.parts ? { parts } : {}),
  } as T;
}

export function normalizeGameUnits<T extends GameUnitLike>(units: T[]): T[] {
  return units.map((unit) => normalizeGameUnit(unit));
}