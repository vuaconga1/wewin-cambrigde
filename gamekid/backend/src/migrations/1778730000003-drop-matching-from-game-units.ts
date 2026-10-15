import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropMatchingFromGameUnits1778730000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game_units" DROP COLUMN IF EXISTS "matching"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game_units" ADD COLUMN "matching" jsonb`);
  }
}
