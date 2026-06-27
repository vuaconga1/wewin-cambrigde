import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateGameUnits1778730000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "game_units",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "slug",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "unit",
            type: "varchar",
          },
          {
            name: "bookname",
            type: "varchar",
          },
          {
            name: "backgroundColor",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "flashcards",
            type: "jsonb",
          },
          {
            name: "quiz",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "wordOrdering",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "wordScramble",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "enabledGames",
            type: "text",
            isArray: true,
          },
          {
            name: "bookType",
            type: "varchar",
            default: "'kids'",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("game_units");
  }
}
