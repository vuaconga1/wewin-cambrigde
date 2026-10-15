import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyItem } from '../entities/vocabulary/vocabulary-item.entity';
import { CreateVocabularyItemDto } from './dto/create-vocabulary-item.dto';
import { UpdateVocabularyItemDto } from './dto/update-vocabulary-item.dto';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(VocabularyItem)
    private readonly repository: Repository<VocabularyItem>,
  ) {}

  async create(data: CreateVocabularyItemDto) {
    const duplicate = await this.repository.findOne({
      where: {
        bookType: data.bookType,
        gameSlug: data.gameSlug,
        wordId: data.wordId,
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        'Vocabulary item already exists for this book, game and word.',
      );
    }

    const vocabularyItem = this.repository.create({
      ...data,
      sectionId: data.sectionId ?? null,
      sectionTitle: data.sectionTitle ?? null,
      emoji: data.emoji ?? null,
      meaning: data.meaning ?? null,
      link: data.link ?? null,
      audioUrl: data.audioUrl ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    return this.repository.save(vocabularyItem);
  }

  findAll() {
    return this.repository.find({
      order: {
        bookType: 'ASC',
        gameSlug: 'ASC',
        sortOrder: 'ASC',
        word: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const vocabularyItem = await this.repository.findOne({
      where: { id },
    });

    if (!vocabularyItem) {
      throw new NotFoundException('Vocabulary item not found');
    }

    return vocabularyItem;
  }

  async update(id: string, data: UpdateVocabularyItemDto) {
    const vocabularyItem = await this.findOne(id);

    const nextBookType = data.bookType ?? vocabularyItem.bookType;
    const nextGameSlug = data.gameSlug ?? vocabularyItem.gameSlug;
    const nextWordId = data.wordId ?? vocabularyItem.wordId;

    if (
      nextBookType !== vocabularyItem.bookType ||
      nextGameSlug !== vocabularyItem.gameSlug ||
      nextWordId !== vocabularyItem.wordId
    ) {
      const duplicate = await this.repository.findOne({
        where: {
          bookType: nextBookType,
          gameSlug: nextGameSlug,
          wordId: nextWordId,
        },
      });

      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(
          'Vocabulary item already exists for this book, game and word.',
        );
      }
    }

    await this.repository.update(id, {
      ...data,
      sectionId: data.sectionId ?? null,
      sectionTitle: data.sectionTitle ?? null,
      emoji: data.emoji ?? null,
      meaning: data.meaning ?? null,
      link: data.link ?? null,
      audioUrl: data.audioUrl ?? null,
    });

    return this.findOne(id);
  }

  remove(id: string) {
    return this.repository.delete(id);
  }
}