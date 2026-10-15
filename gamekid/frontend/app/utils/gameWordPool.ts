import type { WordItem } from "@/types/games";

/** Fisher–Yates shuffle (new array). */
export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ORDERING_ROUND_SIZE = 5;
const MEMORY_MAX_PAIRS = 8;

/**
 * Word Ordering: chia từ thành các câu, mỗi câu tối đa 5 từ.
 * Câu cuối nếu thiếu thì lấy random từ các câu trước để đủ 5.
 * (Nếu tổng từ < 5 thì chỉ 1 câu với số từ hiện có.)
 */
export function buildOrderingRounds(
  words: WordItem[],
  size = ORDERING_ROUND_SIZE,
): WordItem[][] {
  if (words.length === 0) return [];

  const shuffled = shuffleArray(words);
  const rounds: WordItem[][] = [];

  for (let i = 0; i < shuffled.length; i += size) {
    rounds.push(shuffled.slice(i, i + size));
  }

  const lastIndex = rounds.length - 1;
  const last = rounds[lastIndex];

  if (last.length < size && rounds.length > 1) {
    const previous = rounds.slice(0, lastIndex).flat();
    const usedInLast = new Set(last.map((w) => w.id));
    const pool = shuffleArray(previous.filter((w) => !usedInLast.has(w.id)));
    const needed = size - last.length;
    rounds[lastIndex] = [...last, ...pool.slice(0, needed)];
  }

  return rounds;
}

/** Memory: tối đa 8 cặp; mỗi lần chơi random từ pool unit. */
export function pickMemoryWords(
  words: WordItem[],
  maxPairs = MEMORY_MAX_PAIRS,
): WordItem[] {
  return shuffleArray(words).slice(0, Math.min(maxPairs, words.length));
}

export { ORDERING_ROUND_SIZE, MEMORY_MAX_PAIRS };
