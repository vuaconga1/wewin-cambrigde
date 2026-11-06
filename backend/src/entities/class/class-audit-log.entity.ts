import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ClassAuditAction =
  | 'create_class'
  | 'update_class'
  | 'delete_class'
  | 'add_members'
  | 'remove_member'
  | 'assign'
  | 'update_deadline'
  | 'delete_assignment'
  | 'import';

// Không đặt FK tới classes/assignments để log vẫn còn sau khi xóa lớp hoặc bài
@Entity('class_audit_logs')
@Index(['classId', 'createdAt'])
export class ClassAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40 })
  action: ClassAuditAction;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId?: string | null;

  @Column({ name: 'actor_name', type: 'varchar', length: 200, nullable: true })
  actorName?: string | null;

  @Column({ name: 'class_id', type: 'uuid', nullable: true })
  classId?: string | null;

  @Column({ name: 'assignment_id', type: 'uuid', nullable: true })
  assignmentId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  detail?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
