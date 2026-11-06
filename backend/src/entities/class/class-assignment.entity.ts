import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Classroom } from './classroom.entity';

@Entity('class_assignments')
@Index(['classId', 'deadlineAt'])
export class ClassAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @ManyToOne(() => Classroom, (c) => c.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  classroom?: Classroom;

  @Column({ name: 'book_type', type: 'varchar', length: 40 })
  bookType: string;

  @Column({ name: 'unit_slug', type: 'varchar', length: 80 })
  unitSlug: string;

  @Column({ name: 'part_id', type: 'varchar', length: 40 })
  partId: string;

  @Column({ name: 'game_types', type: 'simple-array' })
  gameTypes: string[];

  // Snapshot lúc giao bài, để unit đổi tên vẫn hiển thị đúng
  @Column({ name: 'book_name', type: 'varchar', length: 120 })
  bookName: string;

  @Column({ name: 'unit_name', type: 'varchar', length: 200 })
  unitName: string;

  @Column({ name: 'part_title', type: 'varchar', length: 200, nullable: true })
  partTitle?: string | null;

  @Column({ name: 'deadline_at', type: 'timestamptz' })
  deadlineAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdById?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
