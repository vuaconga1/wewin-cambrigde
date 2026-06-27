import * as path from 'path';
import type { UnitGameConfig } from '../../frontend/types/games';
import {
  type BookType,
  getUnitConfig,
  parseUnitFolder,
} from './vocabulary-seed.helpers';
import {
  matchSectionTitle,
  matchWordByBasename,
} from './audio-import.utils';

export const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

export type ResolvedImage = {
  bookType: BookType;
  gameSlug: string;
  sectionId: string;
  sectionTitle: string;
  wordId: string;
  word: string;
  sourcePath: string;
  relativePath: string;
};

function getWordsForSection(
  unit: UnitGameConfig,
  sectionFolder: string | null,
): {
  sectionId: string;
  sectionTitle: string;
  words: UnitGameConfig['flashcards']['words'];
} | null {
  if (unit.parts?.length) {
    if (!sectionFolder) return null;
    const part = unit.parts.find((p) => matchSectionTitle(sectionFolder, p.title));
    if (!part) return null;
    return { sectionId: part.id, sectionTitle: part.title, words: part.words };
  }

  return {
    sectionId: unit.slug,
    sectionTitle: unit.flashcards.title,
    words: unit.flashcards.words,
  };
}

export function resolveImageRelativePath(
  bookType: BookType,
  relativePath: string,
  imageRoot: string,
): ResolvedImage | null {
  const parts = relativePath.replace(/\\/g, '/').split('/').filter(Boolean);
  const ext = path.extname(parts[parts.length - 1] ?? '').toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return null;
  if (parts[0] !== bookType) return null;

  const unitNumber = parseUnitFolder(parts[1] ?? '');
  if (unitNumber === null) return null;

  const unit = getUnitConfig(bookType, unitNumber);
  if (!unit) return null;

  const basename = path.basename(parts[parts.length - 1], ext);
  let sectionFolder: string | null = null;

  if (parts.length === 3) {
    sectionFolder = null;
  } else if (parts.length === 4) {
    sectionFolder = parts[2];
  } else {
    return null;
  }

  let section = getWordsForSection(unit, sectionFolder);
  let word = section ? matchWordByBasename(basename, section.words) : null;

  if (!word && section && unit.parts?.length) {
    const allWords = unit.parts.flatMap((part) => part.words);
    word = matchWordByBasename(basename, allWords);
    if (word) {
      const part = unit.parts.find((p) => p.words.some((w) => w.id === word!.id));
      if (part) {
        section = { sectionId: part.id, sectionTitle: part.title, words: part.words };
      }
    }
  }

  if (!word && parts.length === 3 && unit.parts?.length) {
    const allWords = unit.parts.flatMap((part) => part.words);
    word = matchWordByBasename(basename, allWords);
    if (word) {
      const part = unit.parts.find((p) => p.words.some((w) => w.id === word!.id));
      section = part
        ? { sectionId: part.id, sectionTitle: part.title, words: part.words }
        : {
            sectionId: unit.slug,
            sectionTitle: unit.flashcards.title,
            words: unit.flashcards.words,
          };
    }
  }

  if (!section || !word) return null;

  const sourcePath = path.join(imageRoot, ...parts);

  return {
    bookType,
    gameSlug: unit.slug,
    sectionId: section.sectionId,
    sectionTitle: section.sectionTitle,
    wordId: word.id,
    word: word.text,
    sourcePath,
    relativePath: parts.join('/'),
  };
}

export function resolveAnyBookImageRelativePath(
  relativePath: string,
  imageRoot: string,
): ResolvedImage | null {
  const bookType = relativePath.replace(/\\/g, '/').split('/')[0] as BookType;
  if (!['kids', 'starter', 'mover', 'flyer'].includes(bookType)) return null;
  return resolveImageRelativePath(bookType, relativePath, imageRoot);
}
