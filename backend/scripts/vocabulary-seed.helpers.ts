import { BOOK_CONFIG } from '../../frontend/lib/constants/bookConfig';
import { STARTER_BOOK_CONFIG } from '../../frontend/lib/constants/starterBookConfig';
import { MOVER_BOOK_CONFIG } from '../../frontend/lib/constants/moverBookConfig';
import { FLYER_BOOK_CONFIG } from '../../frontend/lib/constants/flyerBookConfig';
import type { UnitGameConfig, WordItem } from '../../frontend/types/games';
import { normalizeWord, wordToSlug } from '../src/util/vocab-word.util';

export type BookType = 'kids' | 'starter' | 'mover' | 'flyer';

export type BookSeed = {
  bookType: BookType;
  units: UnitGameConfig[];
};

export const BOOKS: BookSeed[] = [
  { bookType: 'kids', units: BOOK_CONFIG },
  { bookType: 'starter', units: STARTER_BOOK_CONFIG },
  { bookType: 'mover', units: MOVER_BOOK_CONFIG },
  { bookType: 'flyer', units: FLYER_BOOK_CONFIG },
];

export type VocabularyRowShape = {
  bookType: BookType;
  gameSlug: string;
  unit: string;
  unitTitle: string;
  sectionId: string;
  sectionTitle: string;
  wordId: string;
  word: string;
  emoji: string | null;
  meaning: string | null;
  link: string | null;
  audioUrl: string | null;
  sortOrder: number;
};

export function normalizeAudio(word: WordItem): string | undefined {
  return word.audioUrl ?? word.audio;
}

export function buildVocabularyRows(
  bookType: BookType,
  unit: UnitGameConfig,
): VocabularyRowShape[] {
  const sections = unit.parts?.length
    ? unit.parts.map((part) => ({
        sectionId: part.id,
        sectionTitle: part.title,
        words: part.words,
      }))
    : [
        {
          sectionId: unit.slug,
          sectionTitle: unit.flashcards.title,
          words: unit.flashcards.words,
        },
      ];

  return sections.flatMap((section) =>
    section.words.map((word, index) => ({
      bookType,
      gameSlug: unit.slug,
      unit: unit.unit,
      unitTitle: unit.name,
      sectionId: section.sectionId,
      sectionTitle: section.sectionTitle,
      wordId: word.id,
      word: word.text,
      emoji: word.emoji ?? null,
      meaning: word.meaning ?? null,
      link: word.link ?? null,
      audioUrl: normalizeAudio(word) ?? null,
      sortOrder: index,
    })),
  );
}

export function parseUnitFolder(folderName: string): number | null {
  const match = /^unit\s*(\d+)$/i.exec(folderName.trim());
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

export function unitIndexFromFolder(bookType: BookType, unitNumber: number): number | null {
  // starter & flyer: folder "unit N" maps to config index N (both have unit 0)
  if (bookType === 'starter' || bookType === 'flyer') {
    const book = BOOKS.find((b) => b.bookType === bookType);
    if (!book || unitNumber < 0 || unitNumber >= book.units.length) return null;
    return unitNumber;
  }
  const index = unitNumber - 1;
  const book = BOOKS.find((b) => b.bookType === bookType);
  if (!book || index < 0 || index >= book.units.length) return null;
  return index;
}

export function getUnitConfig(
  bookType: BookType,
  unitNumber: number,
): UnitGameConfig | null {
  const index = unitIndexFromFolder(bookType, unitNumber);
  if (index === null) return null;
  const book = BOOKS.find((b) => b.bookType === bookType);
  return book?.units[index] ?? null;
}

export type UniqueWordSeed = {
  word: string;
  slug: string;
  meaning: string | null;
};

function collectWordsFromUnit(unit: UnitGameConfig): WordItem[] {
  const lists: WordItem[][] = [unit.flashcards.words];
  if (unit.parts?.length) {
    lists.push(...unit.parts.map((part) => part.words));
  }
  if (unit.wordOrdering?.words) {
    lists.push(unit.wordOrdering.words);
  }
  if (unit.wordScramble?.words) {
    lists.push(unit.wordScramble.words);
  }
  return lists.flat();
}

/** Unique words across all books — one slug = one vocab image row. */
export function collectUniqueWordsFromBooks(): UniqueWordSeed[] {
  const map = new Map<string, UniqueWordSeed>();

  for (const book of BOOKS) {
    for (const unit of book.units) {
      for (const item of collectWordsFromUnit(unit)) {
        const word = normalizeWord(item.text);
        const slug = wordToSlug(word);
        if (!word || !slug) continue;

        const existing = map.get(slug);
        if (!existing) {
          map.set(slug, {
            word,
            slug,
            meaning: item.meaning ?? null,
          });
          continue;
        }

        if (!existing.meaning && item.meaning) {
          existing.meaning = item.meaning;
        }
      }
    }
  }

  return [...map.values()].sort((a, b) => a.word.localeCompare(b.word));
}
