import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabImage } from '../entities/vocab-image/vocab-image.entity';
import { VocabImageStatus } from '../util/vocab-image.enum';
import {
  normalizeWord,
  pendingImagePublicPath,
  wordToSlug,
} from '../util/vocab-word.util';
import { ImportVocabRowDto } from './dto/import-vocab-row.dto';
import { QueryVocabImagesDto } from './dto/query-vocab-images.dto';
import { VocabImagesGeneratorService } from './vocab-images-generator.service';
import { VocabImagesStorageService } from './vocab-images-storage.service';

export type VocabImageListItem = {
  word: string;
  slug: string;
  imageUrl: string | null;
  status: VocabImageStatus;
  meaning?: string | null;
  rejectedCount: number;
};

@Injectable()
export class VocabImagesService {
  constructor(
    @InjectRepository(VocabImage)
    private readonly repository: Repository<VocabImage>,
    private readonly storage: VocabImagesStorageService,
    private readonly generator: VocabImagesGeneratorService,
  ) {}

  async importRows(rows: ImportVocabRowDto[]) {
    const deduped = new Map<string, ImportVocabRowDto>();
    for (const row of rows) {
      const word = normalizeWord(row.word);
      if (!word) continue;
      const slug = wordToSlug(word);
      if (!slug) continue;
      deduped.set(slug, { ...row, word });
    }
    const saved: VocabImage[] = [];
    for (const row of deduped.values()) {
      const slug = wordToSlug(row.word);
      let record = await this.repository.findOne({ where: { slug } });
      if (!record) {
        record = this.repository.create({
          word: row.word,
          slug,
          meaning: row.meaning ?? null,
          partOfSpeech: row.partOfSpeech ?? null,
          imageStatus: VocabImageStatus.NONE,
          rejectedCount: 0,
        });
      } else {
        record.word = row.word;
        record.meaning = row.meaning ?? record.meaning ?? null;
        record.partOfSpeech = row.partOfSpeech ?? record.partOfSpeech ?? null;
      }
      saved.push(await this.repository.save(record));
    }
    return { imported: saved.length, items: saved };
  }

  async generateMissing(limit = 5) {
    const candidates = await this.repository.find({
      where: [
        { imageStatus: VocabImageStatus.NONE },
        { imageStatus: VocabImageStatus.REJECTED },
      ],
      order: { createAt: 'ASC' },
    });
    const results: Array<{ slug: string; ok: boolean; error?: string }> = [];
    for (const record of candidates) {
      if (results.length >= limit) break;
      if (this.shouldSkipGeneration(record.slug, record.imageStatus)) continue;
      try {
        await this.generateForRecord(record);
        results.push({ slug: record.slug, ok: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        record.lastError = message;
        await this.repository.save(record);
        results.push({ slug: record.slug, ok: false, error: message });
      }
    }
    return {
      processed: results.length,
      limit,
      results,
      hint:
        results.length === 0
          ? 'No words to generate. Run pnpm run seed:vocab-images first.'
          : undefined,
    };
  }

  async findMany(query: QueryVocabImagesDto): Promise<VocabImageListItem[]> {
    const qb = this.repository.createQueryBuilder('v').orderBy('v.word', 'ASC');
    if (query.status) qb.andWhere('v.image_status = :status', { status: query.status });
    if (query.search?.trim()) {
      qb.andWhere('(v.word ILIKE :search OR v.slug ILIKE :search)', {
        search: `%${query.search.trim()}%`,
      });
    }
    const rows = await qb.getMany();
    return rows.map((row) => this.toListItem(row));
  }

  findPending() {
    return this.findMany({ status: VocabImageStatus.PENDING });
  }

  async approve(word: string) {
    const record = await this.findByWordOrSlug(word);
    if (record.imageStatus !== VocabImageStatus.PENDING) {
      throw new BadRequestException('Only pending images can be approved.');
    }
    const approvedUrl = this.storage.movePendingToApproved(record.slug);
    record.imageStatus = VocabImageStatus.APPROVED;
    record.approvedImageUrl = approvedUrl;
    record.pendingImageUrl = null;
    record.lastError = null;
    return this.repository.save(record);
  }

  async reject(word: string) {
    const record = await this.findByWordOrSlug(word);
    if (record.imageStatus !== VocabImageStatus.PENDING) {
      throw new BadRequestException('Only pending images can be rejected.');
    }
    this.storage.movePendingToRejected(record.slug);
    record.imageStatus = VocabImageStatus.REJECTED;
    record.pendingImageUrl = null;
    record.rejectedCount += 1;
    record.lastError = null;
    return this.repository.save(record);
  }

  async regenerate(word: string) {
    const record = await this.findByWordOrSlug(word);
    if (record.imageStatus === VocabImageStatus.APPROVED) {
      throw new BadRequestException('Approved images cannot be regenerated without explicit override.');
    }
    if (record.imageStatus === VocabImageStatus.PENDING) {
      this.storage.archivePendingToRejected(record.slug);
      record.rejectedCount += 1;
    }
    await this.generateForRecord(record);
    return record;
  }

  getApprovedPublicPath(slug: string): string | null {
    if (!this.storage.exists('approved', slug)) return null;
    return `/assets/vocab/approved/${slug}.png`;
  }

  async getApprovedUrlMap(): Promise<Map<string, string>> {
    const rows = await this.repository.find({ where: { imageStatus: VocabImageStatus.APPROVED } });
    const map = new Map<string, string>();
    for (const row of rows) {
      const url = row.approvedImageUrl ?? this.getApprovedPublicPath(row.slug);
      if (url) map.set(row.slug, url);
    }
    return map;
  }

  private shouldSkipGeneration(slug: string, status: VocabImageStatus): boolean {
    if (this.storage.exists('approved', slug)) return true;
    if (this.storage.exists('pending', slug)) return true;
    if (status === VocabImageStatus.APPROVED) return true;
    if (status === VocabImageStatus.PENDING) return true;
    return false;
  }

  private async generateForRecord(record: VocabImage) {
    const buffer = await this.generator.generatePng(record.word);
    const pendingUrl = this.storage.savePending(record.slug, buffer);
    record.imageStatus = VocabImageStatus.PENDING;
    record.pendingImageUrl = pendingUrl;
    record.lastError = null;
    await this.repository.save(record);
  }

  private async findByWordOrSlug(word: string): Promise<VocabImage> {
    const normalized = normalizeWord(word);
    const slug = wordToSlug(normalized);
    const record = await this.repository.findOne({ where: [{ slug }, { word: normalized }] });
    if (!record) throw new NotFoundException(`Vocab image record not found for "${word}".`);
    return record;
  }

  private toListItem(row: VocabImage): VocabImageListItem {
    const imageUrl =
      row.imageStatus === VocabImageStatus.APPROVED
        ? row.approvedImageUrl
        : row.imageStatus === VocabImageStatus.PENDING
          ? row.pendingImageUrl ?? pendingImagePublicPath(row.slug)
          : null;
    return {
      word: row.word,
      slug: row.slug,
      imageUrl: imageUrl ?? null,
      status: row.imageStatus,
      meaning: row.meaning,
      rejectedCount: row.rejectedCount,
    };
  }
}