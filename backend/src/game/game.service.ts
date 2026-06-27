import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameUnit } from '../entities/game/game-unit.entity';
import { VocabImagesService } from '../vocab-images/vocab-images.service';
import { normalizeGameUnit, normalizeGameUnits } from './game-config.helpers';
import { applyApprovedIconsToGameUnit } from './vocab-icon.helpers';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameUnit)
    private gameRepository: Repository<GameUnit>,
    private readonly vocabImagesService: VocabImagesService,
  ) {}

  private async applyIconsToUnit(unit: GameUnit): Promise<GameUnit> {
    const approvedMap = await this.vocabImagesService.getApprovedUrlMap();
    if (approvedMap.size === 0) {
      return unit;
    }
    return applyApprovedIconsToGameUnit(unit, approvedMap);
  }

  private async applyIconsToUnits(units: GameUnit[]): Promise<GameUnit[]> {
    const approvedMap = await this.vocabImagesService.getApprovedUrlMap();
    if (approvedMap.size === 0) {
      return units;
    }
    return units.map((unit) => applyApprovedIconsToGameUnit(unit, approvedMap));
  }

  async getAllGameUnits(bookType?: string) {
    const query = this.gameRepository.createQueryBuilder('game');

    if (bookType) {
      query.where('game.bookType = :bookType', { bookType });
    }

    const units = await query.orderBy('game.createAt', 'ASC').getMany();
    return this.applyIconsToUnits(normalizeGameUnits(units));
  }

  async getGameUnitBySlug(slug: string) {
    const unit = await this.gameRepository.findOne({
      where: { slug },
    });

    if (!unit) {
      return null;
    }

    return this.applyIconsToUnit(normalizeGameUnit(unit));
  }

  async getGameUnitsByType(bookType: string) {
    const units = await this.gameRepository.find({
      where: { bookType },
      order: { createAt: 'ASC' },
    });

    return this.applyIconsToUnits(normalizeGameUnits(units));
  }

  async createGameUnit(data: Partial<GameUnit>) {
    const gameUnit = this.gameRepository.create(normalizeGameUnit(data as GameUnit));
    return normalizeGameUnit(await this.gameRepository.save(gameUnit));
  }

  async updateGameUnit(id: string, data: Partial<GameUnit>) {
    await this.gameRepository.update(id, normalizeGameUnit(data as GameUnit));

    const unit = await this.gameRepository.findOne({
      where: { id },
    });

    return unit ? normalizeGameUnit(unit) : null;
  }

  async deleteGameUnit(id: string) {
    return this.gameRepository.delete(id);
  }
}
