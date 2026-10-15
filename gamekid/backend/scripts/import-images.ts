import * as fs from 'fs';
import * as path from 'path';
import dataSource from '../typeorm.config';
import { VocabImage } from '../src/entities/vocab-image/vocab-image.entity';
import { VocabImageStatus } from '../src/util/vocab-image.enum';
import {
  approvedImagePublicPath,
  normalizeWord,
  pendingImagePublicPath,
  wordToSlug,
} from '../src/util/vocab-word.util';
import { type BookType } from './vocabulary-seed.helpers';
import { resolveAnyBookImageRelativePath } from './image-path-resolver';
import { walkImageFiles, writeVocabPng } from './image-import.utils';

const REPO_ROOT = path.resolve(__dirname, '../..');
const IMAGE_ROOT = process.env.ANH_WEWIN_ROOT ?? path.join(REPO_ROOT, 'anh_wewin');
const PUBLIC_VOCAB_ROOT = path.join(REPO_ROOT, 'frontend', 'public', 'assets', 'vocab');

const DEFAULT_BOOKS: BookType[] = ['kids', 'starter', 'mover', 'flyer'];

type CliOptions = {
  dryRun: boolean;
  only: BookType | null;
  approve: boolean;
  force: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    only: null,
    approve: false,
    force: false,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--approve') options.approve = true;
    else if (arg === '--force') options.force = true;
    else if (arg.startsWith('--only=')) {
      const value = arg.slice('--only='.length) as BookType;
      if (['kids', 'starter', 'mover', 'flyer'].includes(value)) {
        options.only = value;
      }
    }
  }

  return options;
}

function booksToProcess(options: CliOptions): BookType[] {
  return options.only ? [options.only] : DEFAULT_BOOKS;
}

function shouldProcessBook(bookType: string, options: CliOptions): boolean {
  return booksToProcess(options).includes(bookType as BookType);
}

async function ensureVocabFolders(): Promise<void> {
  for (const folder of ['pending', 'approved', 'rejected', 'temp']) {
    const dir = path.join(PUBLIC_VOCAB_ROOT, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(IMAGE_ROOT)) {
    console.error(`Image root not found: ${IMAGE_ROOT}`);
    process.exit(1);
  }

  const books = booksToProcess(options);
  const imageFiles = [...walkImageFiles(IMAGE_ROOT, IMAGE_ROOT)].filter((rel) =>
    shouldProcessBook(rel.split('/')[0], options),
  );

  console.log(`Scanning ${IMAGE_ROOT}`);
  console.log(
    `Found ${imageFiles.length} image file(s) for books: ${books.join(', ')}${options.approve ? ' (approve)' : ' (pending)'}`,
  );

  await dataSource.initialize();
  await ensureVocabFolders();

  const repository = dataSource.getRepository(VocabImage);
  const slugToRecord = new Map<string, VocabImage>();
  for (const row of await repository.find()) {
    slugToRecord.set(row.slug, row);
  }

  const stats = {
    matched: 0,
    imported: 0,
    skippedApproved: 0,
    skippedExists: 0,
    unresolved: 0,
    dbCreated: 0,
    converted: 0,
  };

  const orphans: string[] = [];
  const importedSlugs = new Set<string>();

  for (const relativePath of imageFiles) {
    const resolved = resolveAnyBookImageRelativePath(relativePath, IMAGE_ROOT);
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

    const word = normalizeWord(resolved.word);
    const slug = wordToSlug(word);
    if (!slug) {
      stats.unresolved += 1;
      orphans.push(relativePath);
      continue;
    }

    stats.matched += 1;

    let record = slugToRecord.get(slug);
    if (!record) {
      if (options.dryRun) {
        console.log(`[dry-run] new vocab_images row: ${slug} (${word})`);
        stats.dbCreated += 1;
      } else {
        record = repository.create({
          word,
          slug,
          imageStatus: VocabImageStatus.NONE,
          rejectedCount: 0,
        });
        record = await repository.save(record);
        slugToRecord.set(slug, record);
        stats.dbCreated += 1;
      }
    }

    if (record && !options.force) {
      if (record.imageStatus === VocabImageStatus.APPROVED) {
        stats.skippedApproved += 1;
        continue;
      }
      if (
        !options.approve &&
        record.imageStatus === VocabImageStatus.PENDING &&
        fs.existsSync(path.join(PUBLIC_VOCAB_ROOT, 'pending', `${slug}.png`))
      ) {
        stats.skippedExists += 1;
        continue;
      }
    }

    const folder = options.approve ? 'approved' : 'pending';
    const destPath = path.join(PUBLIC_VOCAB_ROOT, folder, `${slug}.png`);
    const publicUrl = options.approve
      ? approvedImagePublicPath(slug)
      : pendingImagePublicPath(slug);

    if (options.dryRun) {
      console.log(`[dry-run] ${relativePath} -> ${publicUrl} (${word})`);
      importedSlugs.add(slug);
      stats.imported += 1;
      continue;
    }

    const ext = path.extname(resolved.sourcePath).toLowerCase();
    if (ext !== '.png') stats.converted += 1;

    await writeVocabPng(resolved.sourcePath, destPath);

    if (!record) continue;

    record.word = word;
    if (options.approve) {
      record.imageStatus = VocabImageStatus.APPROVED;
      record.approvedImageUrl = publicUrl;
      record.pendingImageUrl = null;
    } else {
      record.imageStatus = VocabImageStatus.PENDING;
      record.pendingImageUrl = publicUrl;
    }
    record.lastError = null;
    await repository.save(record);

    importedSlugs.add(slug);
    stats.imported += 1;
  }

  await dataSource.destroy();

  console.log('\n--- Summary ---');
  console.log(`Matched to vocabulary:  ${stats.matched}`);
  console.log(`Imported:             ${options.dryRun ? '(dry-run)' : stats.imported}`);
  console.log(`DB rows created:      ${options.dryRun ? '(dry-run)' : stats.dbCreated}`);
  console.log(`Converted (non-png):  ${options.dryRun ? '(dry-run)' : stats.converted}`);
  console.log(`Skipped (approved):   ${stats.skippedApproved}`);
  console.log(`Skipped (exists):     ${stats.skippedExists}`);
  console.log(`Unresolved/orphan:    ${stats.unresolved}`);

  if (orphans.length > 0 && orphans.length <= 40) {
    console.log('\nOrphan / unresolved files:');
    orphans.forEach((f) => console.log(`  - ${f}`));
  } else if (orphans.length > 40) {
    console.log(`\nOrphan / unresolved: ${orphans.length} (first 40)`);
    orphans.slice(0, 40).forEach((f) => console.log(`  - ${f}`));
  }

  if (!options.dryRun && stats.imported > 0) {
    console.log(
      `\nView imported images at /vocab-images (filter: ${options.approve ? 'Approved' : 'Pending'}).`,
    );
    if (!options.approve) {
      console.log('Approve images in vocab-images before they appear in games.');
    }
  }
}

main().catch((err) => {
  console.error('Image import failed:', err);
  process.exit(1);
});
