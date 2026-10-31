import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../role/role.entity';
import { BaseEntity } from '../base.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date', nullable: true })
  dob?: Date | null;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email?: string | null;

  // Mã học viên (Mã HV), dùng để đăng nhập thay cho email
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  username?: string | null;

  // Fix: password cần nullable cho Google Login
  @Column({ type: 'text', nullable: true })
  @Exclude()
  password?: string | null;

  // Fix: thêm field image
  @Column({ type: 'text', nullable: true })
  image?: string | null;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  refreshToken?: string | null;

  @Column({ type: 'smallint', default: 0 })
  role: number;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable()
  roles: Role[];
}
