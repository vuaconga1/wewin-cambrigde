import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ClassMember } from './class-member.entity';
import { ClassAssignment } from './class-assignment.entity';

@Entity('classes')
export class Classroom extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mã lớp lấy từ tên sheet Drive (vd. WW00192); lớp tạo tay có thể để trống
  @Column({ type: 'varchar', length: 40, unique: true, nullable: true })
  code?: string | null;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 20, default: 'manual' })
  source: 'manual' | 'drive';

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdById?: string | null;

  @OneToMany(() => ClassMember, (m) => m.classroom)
  members?: ClassMember[];

  @OneToMany(() => ClassAssignment, (a) => a.classroom)
  assignments?: ClassAssignment[];
}
