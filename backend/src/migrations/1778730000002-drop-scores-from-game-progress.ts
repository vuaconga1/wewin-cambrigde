import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropScoresFromGameProgress1778730000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game_progress" DROP COLUMN IF EXISTS "scores"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game_progress" ADD COLUMN "scores" jsonb DEFAULT '{}'`);
  }
}