import * as fs from 'fs';
import * as path from 'path';
import dataSource from '../typeorm.config';
import { VocabImage } from '../src/entities/vocab-image/vocab-image.entity';
import { VocabularyItem } from '../src/entities/vocabulary/vocabulary-item.entity';
import { VocabImageStatus } from '../src/util/vocab-image.enum';
import { normalizeWord, wordToSlug } from '../src/util/vocab-word.util';
import {
  BOOKS,
  buildVocabularyRows,
  type BookType,
} from './vocabulary-seed.helpers';
import {
  hasUppercaseInFilename,
  publicAudioDiskPath,
  publicAudioPath,
} from './audio-import.utils';

const REPO_ROOT = path.resolve(__dirname, '../..');
const PUBLIC_VOCAB_APPROVED = path.join(
  REPO_ROOT,
  'frontend',
  'public',
  'assets',
  'vocab',
  'approved',
);
const PUBLIC_VOCAB_PENDING = path.join(
  REPO_ROOT,
  'frontend',
  'public',
  'assets',
  'vocab',
  'pending',
);
const PUBLIC_AUDIO_ROOT = path.join(REPO_ROOT, 'frontend', 'public', 'audio', 'wewin');
const PUBLIC_ROOT = path.join(REPO_ROOT, 'frontend', 'public');
const REPORT_PATH = path.join(REPO_ROOT, 'frontend', 'notes', 'vocabulary-assets-report.md');

type IssueType =
  | 'missing_image'
  | 'image_pending_only'
  | 'image_db_not_approved'
  | 'image_file_missing'
  | 'missing_audio'
  | 'audio_file_missing'
  | 'audio_url_missing_db'
  | 'audio_uppercase_filename';

type Issue = {
  type: IssueType;
  bookType: BookType;
  unit: string;
  unitTitle: string;
  gameSlug: string;
  wordId: string;
  word: string;
  slug: string;
  detail?: string;
};

function vocabularyKey(bookType: string, gameSlug: string, wordId: string): string {
  return `${bookType}|${gameSlug}|${wordId}`;
}

function publicUrlToDisk(publicUrl: string): string {
  const normalized = publicUrl.startsWith('/') ? publicUrl.slice(1) : publicUrl;
  return path.join(PUBLIC_ROOT, normalized.replace(/\//g, path.sep));
}

function isMissingUrl(value: string | null | undefined): boolean {
  return value == null || value.trim() === '';
}

async function main() {
  await dataSource.initialize();

  const vocabImageRepo = dataSource.getRepository(VocabImage);
  const vocabularyRepo = dataSource.getRepository(VocabularyItem);

  const imageRows = await vocabImageRepo.find();
  const imageBySlug = new Map(imageRows.map((row) => [row.slug, row]));

  const audioRows = await vocabularyRepo.find();
  const audioByKey = new Map(
    audioRows.map((row) => [vocabularyKey(row.bookType, row.gameSlug, row.wordId), row]),
  );

  const issues: Issue[] = [];
  const stats = {
    totalWords: 0,
    uniqueSlugs: new Set<string>(),
    hasApprovedImage: 0,
    hasAudio: 0,
    ok: 0,
  };

  for (const book of BOOKS) {
    for (const unit of book.units) {
      const rows = buildVocabularyRows(book.bookType, unit);
      for (const row of rows) {
        stats.totalWords += 1;
        const slug = wordToSlug(normalizeWord(row.word));
        stats.uniqueSlugs.add(slug);

        const approvedPath = path.join(PUBLIC_VOCAB_APPROVED, `${slug}.png`);
        const pendingPath = path.join(PUBLIC_VOCAB_PENDING, `${slug}.png`);
        const hasApprovedFile = fs.existsSync(approvedPath);
        const hasPendingFile = fs.existsSync(pendingPath);
        const imageRecord = imageBySlug.get(slug);

        let imageOk = false;
        if (hasApprovedFile) {
          imageOk = true;
          stats.hasApprovedImage += 1;
        } else if (hasPendingFile) {
          issues.push({
            type: 'image_pending_only',
            bookType: row.bookType,
            unit: row.unit,
            unitTitle: row.unitTitle,
            gameSlug: row.gameSlug,
            wordId: row.wordId,
            word: row.word,
            slug,
            detail: 'Co anh pending nhung chua approved - khong hien trong game',
          });
        } else {
          issues.push({
            type: 'missing_image',
            bookType: row.bookType,
            unit: row.unit,
            unitTitle: row.unitTitle,
            gameSlug: row.gameSlug,
            wordId: row.wordId,
            word: row.word,
            slug,
          });
        }

        if (
          imageRecord &&
          imageRecord.imageStatus === VocabImageStatus.APPROVED &&
          !hasApprovedFile
        ) {
          issues.push({
            type: 'image_file_missing',
            bookType: row.bookType,
            unit: row.unit,
            unitTitle: row.unitTitle,
            gameSlug: row.gameSlug,
            wordId: row.wordId,
            word: row.word,
            slug,
            detail: `DB approved URL: ${imageRecord.approvedImageUrl ?? 'null'}`,
          });
          imageOk = false;
        } else if (
          imageRecord &&
          imageRecord.imageStatus !== VocabImageStatus.APPROVED &&
          !hasApprovedFile &&
          !hasPendingFile
        ) {
          issues.push({
            type: 'image_db_not_approved',
            bookType: row.bookType,
            unit: row.unit,
            unitTitle: row.unitTitle,
            gameSlug: row.gameSlug,
            wordId: row.wordId,
            word: row.word,
            slug,
            detail: `DB status: ${imageRecord.imageStatus}`,
          });
        }

        const canonicalAudioPath = publicAudioDiskPath(
          PUBLIC_AUDIO_ROOT,
          row.bookType,
          row.gameSlug,
          row.wordId,
        );
        const canonicalAudioUrl = publicAudioPath(row.bookType, row.gameSlug, row.wordId);
        const dbRow = audioByKey.get(vocabularyKey(row.bookType, row.gameSlug, row.wordId));
        const dbAudioUrl = dbRow?.audioUrl ?? row.audioUrl;

        let audioOk = false;
        if (fs.existsSync(canonicalAudioPath)) {
          audioOk = true;
          stats.hasAudio += 1;
          if (hasUppercaseInFilename(canonicalAudioPath)) {
            issues.push({
              type: 'audio_uppercase_filename',
              bookType: row.bookType,
              unit: row.unit,
              unitTitle: row.unitTitle,
              gameSlug: row.gameSlug,
              wordId: row.wordId,
              word: row.word,
              slug,
              detail: path.basename(canonicalAudioPath),
            });
          }
        } else if (!isMissingUrl(dbAudioUrl)) {
          const diskFromDb = publicUrlToDisk(dbAudioUrl!);
          if (fs.existsSync(diskFromDb)) {
            audioOk = true;
            stats.hasAudio += 1;
            if (diskFromDb !== canonicalAudioPath) {
              issues.push({
                type: 'audio_file_missing',
                bookType: row.bookType,
                unit: row.unit,
                unitTitle: row.unitTitle,
                gameSlug: row.gameSlug,
                wordId: row.wordId,
                word: row.word,
                slug,
                detail: `File o duong dan DB (${dbAudioUrl}) nhung khong o duong dan chuan (${canonicalAudioUrl})`,
              });
            }
          } else {
            issues.push({
              type: 'audio_file_missing',
              bookType: row.bookType,
              unit: row.unit,
              unitTitle: row.unitTitle,
              gameSlug: row.gameSlug,
              wordId: row.wordId,
              word: row.word,
              slug,
              detail: `DB audioUrl: ${dbAudioUrl}`,
            });
          }
        } else {
          issues.push({
            type: 'missing_audio',
            bookType: row.bookType,
            unit: row.unit,
            unitTitle: row.unitTitle,
            gameSlug: row.gameSlug,
            wordId: row.wordId,
            word: row.word,
            slug,
          });
        }

        if (audioOk && isMissingUrl(dbAudioUrl)) {
          issues.push({
            type: 'audio_url_missing_db',
            bookType: row.bookType,
            unit: row.unit,
            unitTitle: row.unitTitle,
            gameSlug: row.gameSlug,
            wordId: row.wordId,
            word: row.word,
            slug,
            detail: `File ton tai: ${canonicalAudioUrl}`,
          });
        }

        if (imageOk && audioOk) {
          stats.ok += 1;
        }
      }
    }
  }

  await dataSource.destroy();

  const byType = new Map<IssueType, Issue[]>();
  for (const issue of issues) {
    const list = byType.get(issue.type) ?? [];
    list.push(issue);
    byType.set(issue.type, list);
  }

  const lines: string[] = [
    '# Bao cao kiem tra tu vung - hinh anh & audio',
    '',
    `Ngay tao: ${new Date().toISOString()}`,
    '',
    '## Tong quan',
    '',
    `- Tong so tu (theo unit/section): **${stats.totalWords}**`,
    `- So slug hinh anh duy nhat: **${stats.uniqueSlugs.size}**`,
    `- Tu co anh approved: **${stats.hasApprovedImage}**`,
    `- Tu co audio: **${stats.hasAudio}**`,
    `- Tu day du (anh + audio): **${stats.ok}**`,
    `- Tong so van de: **${issues.length}**`,
    '',
  ];

  const typeLabels: Record<IssueType, string> = {
    missing_image: 'Thieu hinh anh (khong co file approved/pending)',
    image_pending_only: 'Co anh pending - chua hien trong game',
    image_db_not_approved: 'DB chua approve hinh anh',
    image_file_missing: 'DB approved nhung file khong ton tai',
    missing_audio: 'Thieu audio',
    audio_file_missing: 'Audio URL/file khong ton tai hoac sai duong dan',
    audio_url_missing_db: 'Co file audio nhung DB chua co audioUrl',
    audio_uppercase_filename: 'Ten file audio co chu hoa (loi tren Linux)',
  };

  for (const [type, label] of Object.entries(typeLabels) as [IssueType, string][]) {
    const list = byType.get(type) ?? [];
    lines.push(`## ${label} (${list.length})`);
    lines.push('');
    if (list.length === 0) {
      lines.push('_Khong co._');
      lines.push('');
      continue;
    }
    for (const item of list) {
      lines.push(
        `- **${item.word}** (${item.bookType} / ${item.unit} - ${item.unitTitle} / ${item.gameSlug} / ${item.wordId})` +
          (item.detail ? ` - ${item.detail}` : ''),
      );
    }
    lines.push('');
  }

  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');

  console.log('--- Vocabulary assets verification ---');
  console.log(`Total words:        ${stats.totalWords}`);
  console.log(`Unique image slugs: ${stats.uniqueSlugs.size}`);
  console.log(`With approved img:  ${stats.hasApprovedImage}`);
  console.log(`With audio:         ${stats.hasAudio}`);
  console.log(`Fully OK:           ${stats.ok}`);
  console.log(`Issues found:       ${issues.length}`);
  console.log(`\nReport written to: ${REPORT_PATH}`);

  for (const [type, label] of Object.entries(typeLabels) as [IssueType, string][]) {
    const count = byType.get(type)?.length ?? 0;
    if (count > 0) console.log(`  ${label}: ${count}`);
  }
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
