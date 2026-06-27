import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateVocabImages1778730000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vocab_images',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'word', type: 'varchar', length: '255' },
          { name: 'slug', type: 'varchar', length: '255', isUnique: true },
          { name: 'meaning', type: 'text', isNullable: true },
          { name: 'part_of_speech', type: 'varchar', length: '50', isNullable: true },
          {
            name: 'image_status',
            type: 'varchar',
            length: '20',
            default: "'none'",
          },
          { name: 'approved_image_url', type: 'text', isNullable: true },
          { name: 'pending_image_url', type: 'text', isNullable: true },
          { name: 'rejected_count', type: 'int', default: 0 },
          { name: 'last_error', type: 'text', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'create_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'update_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'delete_at', type: 'timestamp', isNullable: true },
        ],
        indices: [
          { name: 'IDX_vocab_images_word', columnNames: ['word'] },
          { name: 'IDX_vocab_images_image_status', columnNames: ['image_status'] },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vocab_images');
  }
}