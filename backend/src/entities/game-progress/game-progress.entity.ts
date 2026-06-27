import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Student } from '../student/student.entity';

@Entity('game_progress')
@Index(['playerId', 'unitSlug', 'partId'], { unique: true })
export class GameProgress extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'varchar', length: 50 })
  playerId: string;

  @Column({ name: 'unit_slug', type: 'varchar', length: 80 })
  unitSlug: string;

  @Column({ name: 'part_id', type: 'varchar', length: 40, default: 'default' })
  partId: string;

  @Column({ name: 'bookname', type: 'varchar', length: 120 })
  bookname: string;

  @Column({ name: 'progress', type: 'jsonb', default: () => "'{}'" })
  progress: Record<string, boolean>;

  @Column({ name: 'student_id', type: 'uuid', nullable: true })
  studentId: string | null;

  @ManyToOne(() => Student, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student | null;
}