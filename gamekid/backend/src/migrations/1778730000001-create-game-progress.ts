import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateGameProgress1778730000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'game_progress',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'player_id',
            type: 'varchar',
            length: '50',
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
            default: "'default'",
          },
          {
            name: 'bookname',
            type: 'varchar',
            length: '120',
          },
          {
            name: 'progress',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'scores',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'student_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'create_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'update_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'delete_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        uniques: [
          {
            name: 'UQ_game_progress_player_unit_part',
            columnNames: ['player_id', 'unit_slug', 'part_id'],
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'game_progress',
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedTableName: 'student',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('game_progress');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.includes('student_id'));

    if (foreignKey) {
      await queryRunner.dropForeignKey('game_progress', foreignKey);
    }

    await queryRunner.dropTable('game_progress');
  }
}