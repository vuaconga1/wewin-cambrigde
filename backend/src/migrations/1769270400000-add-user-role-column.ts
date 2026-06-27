import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoleColumn1769270400000 implements MigrationInterface {
  name = 'AddUserRoleColumn1769270400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" smallint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "role" = 1 WHERE "id" IN (SELECT ur."userId" FROM "user_roles_role" ur INNER JOIN "role" r ON r."id" = ur."roleId" WHERE UPPER(r."name") = 'TEACHER')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
  }
}