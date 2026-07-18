import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateMonthlyGameScore1778730000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'monthly_game_score',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'book_type',
            type: 'varchar',
            length: '40',
          },
          {
            name: 'year',
            type: 'int',
          },
          {
            name: 'month',
            type: 'int',
          },
          {
            name: 'game_key',
            type: 'varchar',
            length: '160',
          },
          {
            name: 'unit_slug',
            type: 'varchar',
            length: '80',
          },
          {
            name: 'part_id',
            type: 'varchar',
            length: '40',
          },
          {
            name: 'game_type',
            type: 'varchar',
            length: '40',
          },
          {
            name: 'best_score',
            type: 'int',
            default: 0,
          },
          {
            name: 'student_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          {
            name: 'UQ_monthly_game_score_student_game_month',
            columnNames: ['student_id', 'game_key', 'year', 'month'],
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'monthly_game_score',
      new TableIndex({
        name: 'IDX_monthly_game_score_book_month',
        columnNames: ['book_type', 'year', 'month'],
      }),
    );

    await queryRunner.createForeignKey(
      'monthly_game_score',
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedTableName: 'student',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('monthly_game_score');
  }
}
