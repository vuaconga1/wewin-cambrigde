import { MigrationInterface, QueryRunner } from 'typeorm';
import { GameUnit } from '../entities/game/game-unit.entity';
import { normalizeGameUnit } from '../game/game-config.helpers';

export class NormalizeGameUnitsGames1778730000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.manager.getRepository(GameUnit);
    const units = await repository.find();

    for (const unit of units) {
      await repository.save(normalizeGameUnit(unit));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.manager.getRepository(GameUnit);
    const units = await repository.find();

    for (const unit of units) {
      await repository.save({
        ...unit,
        enabledGames: ['flip', 'speak'],
      });
    }
  }
}