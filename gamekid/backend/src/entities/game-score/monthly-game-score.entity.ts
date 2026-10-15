import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';

@Entity('monthly_game_score')
@Index(['studentId', 'gameKey', 'year', 'month'], { unique: true })
@Index(['bookType', 'year', 'month'])
export class MonthlyGameScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'book_type', type: 'varchar', length: 40 })
  bookType: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
