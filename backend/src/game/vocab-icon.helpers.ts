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

export function applyApprovedIconsToGameUnit(unit: GameUnit, approvedMap: Map<string, string>): GameUnit {
  if (approvedMap.size === 0) return unit;
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