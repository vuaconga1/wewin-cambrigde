export const GAMES_LIBRARY_PATH = "/games";

const ANCHOR_KEY = "wewin_games_lb_anchor";
const HREF_KEY = "wewin_games_lb_href";const PAIR_KEY = "wewin_games_lb_pair";

export function markLeaderboardVisit(fromPath: string, leaderboardHref: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ANCHOR_KEY, fromPath);
  sessionStorage.setItem(HREF_KEY, leaderboardHref);
  sessionStorage.setItem(PAIR_KEY, "1");
}

export function clearLeaderboardPair() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PAIR_KEY);
  sessionStorage.removeItem(ANCHOR_KEY);
  sessionStorage.removeItem(HREF_KEY);
}

export function getLeaderboardAnchor(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ANCHOR_KEY);
}

export function getLeaderboardHref(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(HREF_KEY);
}

export function isLeaderboardPairActive(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PAIR_KEY) === "1";
}

export function shouldBackToLeaderboard(currentPath: string): boolean {
  if (!isLeaderboardPairActive()) return false;
  const anchor = getLeaderboardAnchor();
  return anchor != null && anchor === currentPath;
}

export function resolveLeaderboardHome(fallback: string): string {
  return getLeaderboardAnchor() || fallback;
}

/** Xóa chế độ toggle nếu user đi sang trang khác (không phải anchor / leaderboard). */
export function syncLeaderboardPair(currentPath: string) {
  if (typeof window === "undefined") return;
  const anchor = getLeaderboardAnchor();
  const href = getLeaderboardHref();
  if (!isLeaderboardPairActive()) return;
  if (currentPath === anchor || currentPath === href) return;
  clearLeaderboardPair();
}
