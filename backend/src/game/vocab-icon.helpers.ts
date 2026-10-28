import { GameUnit } from '../entities/game/game-unit.entity';
import { normalizeWord, wordToSlug } from '../util/vocab-word.util';

type WordLike = { text: string; icon?: string };

function applyIconsToWords<T extends WordLike>(words: T[], approvedMap: Map<string, string>): T[] {
  return words.map((word) => {
    const slug = wordToSlug(normalizeWord(word.text));
    const icon = approvedMap.get(slug);
    return icon ? { ...word, icon } : word;
  });
}

// Super Kids dùng hình cắt từ sách, không thay bằng ảnh chung trong vocab_images.
const BOOK_TYPES_WITH_OWN_ICONS = new Set(['super-kids']);

export function applyApprovedIconsToGameUnit(unit: GameUnit, approvedMap: Map<string, string>): GameUnit {
  if (approvedMap.size === 0 || BOOK_TYPES_WITH_OWN_ICONS.has(unit.bookType)) return unit;
  return {
    ...unit,
    flashcards: { ...unit.flashcards, words: applyIconsToWords(unit.flashcards.words, approvedMap) },
    wordOrdering: unit.wordOrdering
      ? { ...unit.wordOrdering, words: applyIconsToWords(unit.wordOrdering.words, approvedMap) }
      : unit.wordOrdering,
    wordScramble: unit.wordScramble
      ? { ...unit.wordScramble, words: applyIconsToWords(unit.wordScramble.words, approvedMap) }
      : unit.wordScramble,
    parts: unit.parts?.map((part) => ({ ...part, words: applyIconsToWords(part.words, approvedMap) })),
  };
}