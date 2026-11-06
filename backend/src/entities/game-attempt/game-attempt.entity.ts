import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';

// Mỗi lần chơi xong một game là một dòng (append-only)
@Entity('game_attempts')
@Index(['playerId', 'unitSlug', 'partId', 'gameType', 'createdAt'])
export class GameAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'varchar', length: 50 })
  playerId: string;

  @Column({ name: 'student_id', type: 'uuid', nullable: true })
  studentId?: string | null;

  @ManyToOne(() => Student, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'student_id' })
  student?: Student | null;

  @Column({ name: 'unit_slug', type: 'varchar', length: 80 })
  unitSlug: string;

  @Column({ name: 'part_id', type: 'varchar', length: 40 })
  partId: string;

  @Column({ name: 'game_type', type: 'varchar', length: 40 })
  gameType: string;

  @Column({ name: 'book_type', type: 'varchar', length: 40, nullable: true })
  bookType?: string | null;

  @Column({ type: 'int' })
  score: number;

  @Column({ name: 'max_score', type: 'int', nullable: true })
  maxScore?: number | null;

  @Column({ name: 'item_count', type: 'int', nullable: true })
  itemCount?: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
