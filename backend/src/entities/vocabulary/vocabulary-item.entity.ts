import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('vocabulary_items')
@Unique(['bookType', 'gameSlug', 'wordId'])
export class VocabularyItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar' })
  bookType!: string;

  @Index()
  @Column({ type: 'varchar' })
  gameSlug!: string;

  @Index()
  @Column({ type: 'varchar' })
  unit!: string;

  @Column({ type: 'varchar' })
  unitTitle!: string;

  @Column({ type: 'varchar', nullable: true })
  sectionId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  sectionTitle?: string | null;

  @Column({ type: 'varchar' })
  wordId!: string;

  @Column({ type: 'varchar' })
  word!: string;

  @Column({ type: 'varchar', nullable: true })
  emoji?: string | null;

  @Column({ type: 'text', nullable: true })
  meaning?: string | null;

  @Column({ type: 'text', nullable: true })
  link?: string | null;

  @Column({ type: 'text', nullable: true })
  audioUrl?: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;
}