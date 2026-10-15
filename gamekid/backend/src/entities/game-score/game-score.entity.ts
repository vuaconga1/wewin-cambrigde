import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';

@Entity('game_score')
@Index(['gameKey', 'studentId'], { unique: true })
export class GameScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ex: `${unitSlug}:${partId}:${gameType}`
  @Column({ name: 'game_key', type: 'varchar', length: 160 })
  gameKey: string;

  @Column({ name: 'unit_slug', type: 'varchar', length: 80 })
  unitSlug: string;

  @Column({ name: 'part_id', type: 'varchar', length: 40 })
  partId: string;

  @Column({ name: 'game_type', type: 'varchar', length: 40 })
  gameType: string;

  @Column({ name: 'best_score', type: 'int', default: 0 })
  bestScore: number;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

