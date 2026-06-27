import * as fs from 'fs';
import * as path from 'path';
import dataSource from '../typeorm.config';
import { VocabularyItem } from '../src/entities/vocabulary/vocabulary-item.entity';
import { type BookType } from './vocabulary-seed.helpers';
import type { WordItem } from '../../frontend/types/games';
import { resolveAnyBookRelativePath } from './audio-path-resolver';
import {
  hasUppercaseInFilename,
  matchWordByBasename,
  publicAudioDiskPath,
  publicAudioPath,
} from './audio-import.utils';

const REPO_ROOT = path.resolve(__dirname, '../..');
const AUDIO_ROOT = process.env.AUDIO_WEWIN_ROOT ?? path.join(REPO_ROOT, 'audio_wewin');
const PUBLIC_AUDIO_ROOT = path.join(REPO_ROOT, 'frontend', 'public', 'audio', 'wewin');

type CliOptions = {
  dryRun: boolean;
  skipCopy: boolean;
  only: BookType | null;
  verifyLinux: boolean;
  syncPublic: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    skipCopy: false,
    only: null,
    verifyLinux: false,
    syncPublic: false,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--skip-copy') options.skipCopy = true;
    else if (arg === '--verify-linux') options.verifyLinux = true;
    else if (arg === '--sync-public') options.syncPublic = true;
    else if (arg.startsWith('--only=')) {
      const value = arg.slice('--only='.length) as BookType;
      if (['kids', 'starter', 'mover', 'flyer'].includes(value)) {
        options.only = value;
      }
    }
  }

  return options;
}

function* walkMp3Files(dir: string, baseDir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkMp3Files(fullPath, baseDir);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
      const relative = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      yield relative;
    }
  }
}

function vocabularyKey(bookType: string, gameSlug: string, wordId: string): string {
  return `${bookType}|${gameSlug}|${wordId}`;
}

function isMissingAudioUrl(value: string | null | undefined): boolean {
  return value == null || value.trim() === '';
}

async function syncFromPublic(options: CliOptions): Promise<void> {
  if (!fs.existsSync(PUBLIC_AUDIO_ROOT)) {
    console.error(`Public audio root not found: ${PUBLIC_AUDIO_ROOT}`);
    process.exit(1);
  }

  await dataSource.initialize();
  const vocabularyRepository = dataSource.getRepository(VocabularyItem);
  const allRows = await vocabularyRepository.find();

  const rowByLowerKey = new Map<string, VocabularyItem>();
  const rowsByGame = new Map<string, VocabularyItem[]>();
  for (const row of allRows) {
    rowByLowerKey.set(
      vocabularyKey(row.bookType, row.gameSlug, row.wordId.toLowerCase()),
      row,
    );
    const gameKey = vocabularyKey(row.bookType, row.gameSlug, '');
    const list = rowsByGame.get(gameKey) ?? [];
    list.push(row);
    rowsByGame.set(gameKey, list);
  }

  const stats = {
    filesScanned: 0,
    filesMatchedDb: 0,
    updatedFromNull: 0,
    updatedUrlChanged: 0,
    orphanFiles: 0,
    canonicalCopied: 0,
  };
  const orphanSamples: string[] = [];

  const rowsToWordItems = (rows: VocabularyItem[]): WordItem[] =>
    rows.map((r) => ({ id: r.wordId, text: r.word }));

  const resolveRowForPublicFile = (
    bookType: string,
    gameSlug: string,
    basename: string,
  ): VocabularyItem | null => {
    const byId = rowByLowerKey.get(
      vocabularyKey(bookType, gameSlug, basename.toLowerCase()),
    );
    if (byId) return byId;
    const gameRows = rowsByGame.get(vocabularyKey(bookType, gameSlug, '')) ?? [];
    const matched = matchWordByBasename(basename, rowsToWordItems(gameRows));
    if (!matched) return null;
    return gameRows.find((r) => r.wordId === matched.id) ?? null;
  };

  const applyAudioUrl = async (
    row: VocabularyItem,
    sourceFilePath: string,
  ): Promise<void> => {
    const audioUrl = publicAudioPath(row.bookType, row.gameSlug, row.wordId);
    const canonicalPath = publicAudioDiskPath(
      PUBLIC_AUDIO_ROOT,
      row.bookType,
      row.gameSlug,
      row.wordId,
    );
    const wasNull = isMissingAudioUrl(row.audioUrl);

    if (sourceFilePath !== canonicalPath && !fs.existsSync(canonicalPath)) {
      if (!options.dryRun) {
        fs.mkdirSync(path.dirname(canonicalPath), { recursive: true });
        fs.copyFileSync(sourceFilePath, canonicalPath);
      }
      stats.canonicalCopied += 1;
    }

    if (row.audioUrl === audioUrl) return;

    if (!options.dryRun) {
      await vocabularyRepository.update(row.id, { audioUrl });
    }
    if (wasNull) stats.updatedFromNull += 1;
    else stats.updatedUrlChanged += 1;
    row.audioUrl = audioUrl;
  };

  for (const relative of walkMp3Files(PUBLIC_AUDIO_ROOT, PUBLIC_AUDIO_ROOT)) {
    if (options.only && !relative.startsWith(`${options.only}/`)) continue;
    stats.filesScanned += 1;
    const parts = relative.split('/');
    if (parts.length !== 3) {
      stats.orphanFiles += 1;
      if (orphanSamples.length < 20) orphanSamples.push(relative);
      continue;
    }

    const [bookType, gameSlug, filename] = parts;
    const basename = path.basename(filename, path.extname(filename));
    const row = resolveRowForPublicFile(bookType, gameSlug, basename);
    if (!row) {
      stats.orphanFiles += 1;
      if (orphanSamples.length < 20) orphanSamples.push(relative);
      continue;
    }

    stats.filesMatchedDb += 1;
    const sourceFilePath = path.join(PUBLIC_AUDIO_ROOT, relative);
    const audioUrl = publicAudioPath(row.bookType, row.gameSlug, row.wordId);
    const needsUpdate =
      isMissingAudioUrl(row.audioUrl) || row.audioUrl !== audioUrl;
    const canonicalPath = publicAudioDiskPath(
      PUBLIC_AUDIO_ROOT,
      row.bookType,
      row.gameSlug,
      row.wordId,
    );
    const needsCanonical =
      sourceFilePath !== canonicalPath && !fs.existsSync(canonicalPath);
    if (!needsUpdate && !needsCanonical) continue;

    if (options.dryRun) {
      console.log(
        `[dry-run] ${relative} -> ${audioUrl}${needsCanonical ? ' (+canonical)' : ''}`,
      );
    }
    await applyAudioUrl(row, sourceFilePath);
  }

  for (const row of allRows) {
    if (options.only && row.bookType !== options.only) continue;
    if (!isMissingAudioUrl(row.audioUrl)) continue;

    const gameDir = path.join(PUBLIC_AUDIO_ROOT, row.bookType, row.gameSlug);
    if (!fs.existsSync(gameDir)) continue;

    const canonicalPath = publicAudioDiskPath(
      PUBLIC_AUDIO_ROOT,
      row.bookType,
      row.gameSlug,
      row.wordId,
    );
    let sourcePath: string | null = fs.existsSync(canonicalPath) ? canonicalPath : null;

    if (!sourcePath) {
      const gameRows = rowsByGame.get(vocabularyKey(row.bookType, row.gameSlug, '')) ?? [];
      for (const entry of fs.readdirSync(gameDir)) {
        if (!entry.toLowerCase().endsWith('.mp3')) continue;
        const entryBasename = path.basename(entry, path.extname(entry));
        const matched = matchWordByBasename(entryBasename, rowsToWordItems(gameRows));
        if (matched?.id === row.wordId) {
          sourcePath = path.join(gameDir, entry);
          break;
        }
      }
    }

    if (!sourcePath) continue;
    if (options.dryRun) {
      console.log(
        `[dry-run] row scan: ${row.bookType}/${row.gameSlug}/${row.wordId}`,
      );
    }
    await applyAudioUrl(row, sourcePath);
  }

  const nullRows = allRows.filter((row) => {
    if (options.only && row.bookType !== options.only) return false;
    return isMissingAudioUrl(row.audioUrl);
  });

  await dataSource.destroy();

  console.log('\n--- Sync from public ---');
  console.log(`Files scanned:        ${stats.filesScanned}`);
  console.log(`Files matched DB:     ${stats.filesMatchedDb}`);
  console.log(
    `DB updated (null):    ${options.dryRun ? '(dry-run)' : stats.updatedFromNull}`,
  );
  console.log(
    `DB updated (url fix): ${options.dryRun ? '(dry-run)' : stats.updatedUrlChanged}`,
  );
  console.log(
    `Canonical copies:     ${options.dryRun ? '(dry-run)' : stats.canonicalCopied}`,
  );
  console.log(`Orphan public files:  ${stats.orphanFiles}`);
  console.log(`\n--- audioUrl still null/empty ---`);
  console.log(`Total: ${nullRows.length}`);

  const nullByBook = new Map<string, number>();
  for (const row of nullRows) {
    nullByBook.set(row.bookType, (nullByBook.get(row.bookType) ?? 0) + 1);
  }
  for (const [book, count] of [...nullByBook.entries()].sort()) {
    console.log(`  ${book}: ${count}`);
  }

  if (nullRows.length > 0) {
    const limit = Math.min(nullRows.length, 40);
    console.log(`\nFirst ${limit} row(s) without audioUrl:`);
    for (const row of nullRows.slice(0, limit)) {
      console.log(
        `  - ${row.bookType} | ${row.gameSlug} | ${row.wordId} (${row.word})`,
      );
    }
  }

  if (orphanSamples.length > 0) {
    console.log('\nOrphan public files (no DB row), sample:');
    orphanSamples.forEach((f) => console.log(`  - ${f}`));
  }

  if (!options.dryRun) {
    const ok = await verifyLinuxPaths();
    if (!ok) process.exit(1);
  }
}

async function verifyLinuxPaths(): Promise<boolean> {
  let ok = true;
  if (!fs.existsSync(PUBLIC_AUDIO_ROOT)) {
    console.log('verify-linux: no public audio folder yet');
    return true;
  }

  for (const entry of walkMp3Files(PUBLIC_AUDIO_ROOT, PUBLIC_AUDIO_ROOT)) {
    const full = path.join(PUBLIC_AUDIO_ROOT, entry);
    if (hasUppercaseInFilename(full)) {
      console.log(`FAIL uppercase filename: ${entry}`);
      ok = false;
    }
  }

  if (ok) console.log('OK verify-linux: all public audio filenames are lowercase');
  return ok;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.verifyLinux) {
    const ok = await verifyLinuxPaths();
    process.exit(ok ? 0 : 1);
  }

  if (options.syncPublic) {
    await syncFromPublic(options);
    return;
  }

  if (!fs.existsSync(AUDIO_ROOT)) {
    console.error(`Audio root not found: ${AUDIO_ROOT}`);
    process.exit(1);
  }

  const mp3Files = [...walkMp3Files(AUDIO_ROOT, AUDIO_ROOT)].filter((rel) => {
    if (!options.only) return true;
    return rel.startsWith(`${options.only}/`);
  });

  console.log(`Scanning ${AUDIO_ROOT}`);
  console.log(`Found ${mp3Files.length} mp3 file(s)${options.only ? ` (only=${options.only})` : ''}`);

  await dataSource.initialize();
  const vocabularyRepository = dataSource.getRepository(VocabularyItem);

  const allRows = await vocabularyRepository.find();
  const rowByKey = new Map<string, VocabularyItem>();
  for (const row of allRows) {
    rowByKey.set(vocabularyKey(row.bookType, row.gameSlug, row.wordId), row);
  }

  const stats = {
    matched: 0,
    updated: 0,
    copied: 0,
    missingDbRow: 0,
    unresolved: 0,
    skippedCopyExists: 0,
  };

  const orphans: string[] = [];
  const updatedKeys = new Set<string>();

  for (const relativePath of mp3Files) {
    const resolved = resolveAnyBookRelativePath(relativePath, AUDIO_ROOT);
    if (!resolved) {
      stats.unresolved += 1;
      orphans.push(relativePath);
      continue;
    }

    if (!fs.existsSync(resolved.sourcePath)) {
      stats.unresolved += 1;
      orphans.push(relativePath);
      continue;
    }

    const key = vocabularyKey(resolved.bookType, resolved.gameSlug, resolved.wordId);
    const row = rowByKey.get(key);
    if (!row) {
      stats.missingDbRow += 1;
      console.log(`WARN no DB row: ${relativePath} -> ${key}`);
      continue;
    }

    stats.matched += 1;
    const audioUrl = publicAudioPath(
      resolved.bookType,
      resolved.gameSlug,
      resolved.wordId,
    );
    const destPath = path.join(
      PUBLIC_AUDIO_ROOT,
      resolved.bookType,
      resolved.gameSlug,
      `${resolved.wordId.toLowerCase()}.mp3`,
    );

    if (options.dryRun) {
      console.log(`[dry-run] ${relativePath} -> ${audioUrl}`);
      updatedKeys.add(key);
      continue;
    }

    if (!options.skipCopy) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(resolved.sourcePath, destPath);
        stats.copied += 1;
      } else {
        stats.skippedCopyExists += 1;
      }
    }

    if (row.audioUrl !== audioUrl) {
      await vocabularyRepository.update(row.id, { audioUrl });
      stats.updated += 1;
    }

    updatedKeys.add(key);
  }

  const missingFiles: string[] = [];
  for (const row of allRows) {
    if (options.only && row.bookType !== options.only) continue;
    const key = vocabularyKey(row.bookType, row.gameSlug, row.wordId);
    if (!updatedKeys.has(key) && isMissingAudioUrl(row.audioUrl)) {
      missingFiles.push(`${row.bookType} / ${row.gameSlug} / ${row.wordId} (${row.word})`);
    }
  }

  await dataSource.destroy();

  console.log('\n--- Summary ---');
  console.log(`Matched:              ${stats.matched}`);
  console.log(`DB updated:           ${options.dryRun ? '(dry-run)' : stats.updated}`);
  console.log(`Files copied:         ${options.dryRun ? '(dry-run)' : stats.copied}`);
  console.log(`Copy skipped (exist): ${stats.skippedCopyExists}`);
  console.log(`Unresolved/orphan:    ${stats.unresolved}`);
  console.log(`Missing DB row:       ${stats.missingDbRow}`);
  console.log(`DB rows still no file: ${missingFiles.length}`);

  if (orphans.length > 0 && orphans.length <= 30) {
    console.log('\nOrphan / unresolved files:');
    orphans.forEach((f) => console.log(`  - ${f}`));
  } else if (orphans.length > 30) {
    console.log(`\nOrphan / unresolved: ${orphans.length} (first 30)`);
    orphans.slice(0, 30).forEach((f) => console.log(`  - ${f}`));
  }

  if (!options.dryRun && stats.matched > 0) {
    const ok = await verifyLinuxPaths();
    if (!ok) process.exit(1);
  }
}

main().catch((err) => {
  console.error('Audio import failed:', err);
  process.exit(1);
});
