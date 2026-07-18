/** bookType in DB ↔ public route segment */
export const BOOK_TYPE_TO_ROUTE: Record<string, string> = {
  kids: "kids",
  starter: "starters",
  mover: "movers",
  flyer: "flyers",
};

export const ROUTE_TO_BOOK_TYPE: Record<string, string> = {
  kids: "kids",
  starters: "starter",
  movers: "mover",
  flyers: "flyer",
};

export const BOOK_TYPE_LABEL: Record<string, string> = {
  kids: "Kids Games",
  starter: "Starters Games",
  mover: "Movers Games",
  flyer: "Flyers Games",
};

export const BOOK_PLAYER_STORAGE_KEY: Record<string, string> = {
  kids: "kids_book_player_id",
  starter: "starter_book_player_id",
  mover: "mover_book_player_id",
  flyer: "flyer_book_player_id",
};

export function leaderboardPathForBookType(bookType?: string) {
  if (!bookType) return undefined;
  const route = BOOK_TYPE_TO_ROUTE[bookType] ?? bookType;
  return `/games/${route}/leaderboard`;
}

export function bookTypeFromRoute(routeSegment: string) {
  return ROUTE_TO_BOOK_TYPE[routeSegment] ?? routeSegment;
}
