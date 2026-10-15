import * as path from 'path';
import type { WordItem } from '../../frontend/types/games';

export function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function slugify(value: string): string {
  return normalizeKey(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const FILENAME_ALIASES: Record<string, string> = {
  lolipop: 'lollipop',
  'ginger bread': 'gingerbread',
  hits: 'his',
  lorry: 'lorry',
  flat: 'flat',
  meatball: 'meatballs',
  children: 'children',
  sweeo: 'sweep',
  'grandad grandfather': 'grandad',
  'grandma grandmother': 'grandma',
  rocket: 'rocket ship',
  'note book': 'notebook',
  caterpilla: 'caterpillar',
  knighy: 'knight',
  newspapers: 'newspaper',
  hes: 'his',
};

export function normalizeSectionKey(title: string): string {
  return normalizeKey(title);
}

function stripSectionDecorations(title: string): string {
  return title
    .replace(/^part\s*\d+\s*:\s*/i, '')
    .replace(/\s*\/\s*/g, ' ')
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordTextMatchKeys(text: string): string[] {
  const keys = new Set<string>([normalizeKey(text)]);
  const parts = text.split(/\s*\/\s*/);
  if (parts.length > 1) {
    for (const part of parts) {
      keys.add(normalizeKey(part.trim()));
    }
  }
  return [...keys];
}

export function matchSectionTitle(folderName: string, sectionTitle: string): boolean {
  const a = normalizeSectionKey(stripSectionDecorations(folderName));
  const b = normalizeSectionKey(stripSectionDecorations(sectionTitle));
  if (a === b) return true;
  const stripParens = (s: string) => s.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  return stripParens(a) === stripParens(b);
}

export function resolveBasenameToKey(basename: string): string {
  const key = normalizeKey(basename);
  return FILENAME_ALIASES[key] ?? key;
}

export function matchWordByBasename(
  basename: string,
  words: WordItem[],
): WordItem | null {
  const lookupKey = resolveBasenameToKey(basename);

  for (const word of words) {
    if (wordTextMatchKeys(word.text).includes(lookupKey)) return word;
  }
  for (const word of words) {
    if (slugify(word.text) === slugify(lookupKey)) return word;
  }
  for (const word of words) {
    if (wordTextMatchKeys(word.text).some((k) => slugify(k) === slugify(lookupKey))) {
      return word;
    }
  }
  for (const word of words) {
    if (normalizeKey(word.id.replace(/-/g, ' ')) === lookupKey) return word;
  }
  for (const word of words) {
    if (slugify(word.id) === slugify(lookupKey)) return word;
  }

  const pluralKey = lookupKey.endsWith('s') ? lookupKey.slice(0, -1) : `${lookupKey}s`;
  for (const word of words) {
    if (wordTextMatchKeys(word.text).includes(pluralKey)) return word;
  }

  return null;
}

export function publicAudioPath(
  bookType: string,
  gameSlug: string,
  wordId: string,
  ext: 'mp3' | 'wav' = 'mp3',
): string {
  return `/audio/wewin/${bookType}/${gameSlug}/${wordId.toLowerCase()}.${ext}`;
}

export function publicAudioDiskPath(
  publicAudioRoot: string,
  bookType: string,
  gameSlug: string,
  wordId: string,
  ext: 'mp3' | 'wav' = 'mp3',
): string {
  return path.join(
    publicAudioRoot,
    bookType,
    gameSlug,
    `${wordId.toLowerCase()}.${ext}`,
  );
}

export function hasUppercaseInFilename(filePath: string): boolean {
  const base = filePath.split(/[/\\]/).pop() ?? '';
  return base !== base.toLowerCase();
}
