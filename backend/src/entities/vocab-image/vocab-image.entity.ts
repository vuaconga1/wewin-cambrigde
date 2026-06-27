import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { VocabImageStatus } from '../../util/vocab-image.enum';

@Entity('vocab_images')
@Unique(['slug'])
export class VocabImage extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  word!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  meaning?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'part_of_speech' })
  partOfSpeech?: string | null;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: VocabImageStatus.NONE,
    name: 'image_status',
  })
  imageStatus!: VocabImageStatus;

  @Column({ type: 'text', nullable: true, name: 'approved_image_url' })
  approvedImageUrl?: string | null;

  @Column({ type: 'text', nullable: true, name: 'pending_image_url' })
  pendingImageUrl?: string | null;

  @Column({ type: 'int', default: 0, name: 'rejected_count' })
  rejectedCount!: number;

  @Column({ type: 'text', nullable: true, name: 'last_error' })
  lastError?: string | null;
}