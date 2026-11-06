import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/entities/user/user.entity';
import { Role } from 'src/entities/role/role.entity';

const TEACHER_ROLE_NAME = 'TEACHER';

function resolveBinaryRole(role?: number, roles?: Role[]) {
  if (role === 1) {
    return 1;
  }

  if (role === 0) {
    return 0;
  }

  return roles?.some((item) => item.name === TEACHER_ROLE_NAME) ? 1 : 0;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  /** Chuẩn hóa email/username ('' -> null) và chặn trùng (không phân biệt hoa thường) */
  private async normalizeIdentity(
    data: { email?: string | null; username?: string | null },
    excludeId?: string,
  ) {
    const result: { email?: string | null; username?: string | null } = {};
    if (data.email !== undefined) result.email = data.email?.trim() || null;
    if (data.username !== undefined) {
      result.username = data.username?.trim() || null;
    }

    for (const field of ['email', 'username'] as const) {
      const value = result[field];
      if (!value) continue;
      const qb = this.repo
        .createQueryBuilder('u')
        .where(`LOWER(u.${field}) = LOWER(:value)`, { value });
      if (excludeId) qb.andWhere('u.id != :excludeId', { excludeId });
      if (await qb.getExists()) {
        throw new ConflictException(
          field === 'email' ? 'Email đã được dùng' : 'Tên đăng nhập đã được dùng',
        );
      }
    }
    return result;
  }

  async create(data: CreateUserDto) {
    const roles = data.roleIds?.length
      ? await this.roleRepo.find({ where: { id: In(data.roleIds) } })
      : [];
    const identity = await this.normalizeIdentity(data);
    if (!identity.email && !identity.username) {
      throw new BadRequestException('Cần nhập email hoặc tên đăng nhập');
    }

    const user = this.repo.create({
      name: data.name,
      ...identity,
      password: data.password ? await bcrypt.hash(data.password, 10) : null,
      phone: data.phone || null,
      address: data.address || null,
      dob: data.dob || null,
      image: data.image || null,
      isActive: data.isActive ?? true,
      role: resolveBinaryRole(data.role, roles),
      roles,
    });

    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find({ relations: ['roles', 'roles.permissions'] });
  }

  findOne(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id }, relations: ['roles'] });
    if (!user) throw new NotFoundException('User not found');

    const { roleIds, password, email, username, role, ...rest } = data;
    const identity = await this.normalizeIdentity({ email, username }, id);
    const nextEmail = identity.email !== undefined ? identity.email : user.email;
    const nextUsername =
      identity.username !== undefined ? identity.username : user.username;
    if (!nextEmail && !nextUsername) {
      throw new BadRequestException('Cần có email hoặc tên đăng nhập');
    }

    Object.assign(user, rest, identity);
    if (rest.dob !== undefined) user.dob = rest.dob || null;
    if (password) user.password = await bcrypt.hash(password, 10);

    if (roleIds) {
      user.roles = await this.roleRepo.find({ where: { id: In(roleIds) } });
    }
    if (role !== undefined) user.role = role;
    else if (roleIds) user.role = resolveBinaryRole(undefined, user.roles);

    await this.repo.save(user);
    return this.findOne(id);
  }

  async addRoleToUser(userId: string, roleId: string) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');

    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const hasRole = user.roles.some((r) => r.id === roleId);
    if (hasRole) {
      throw new BadRequestException('User already has this role');
    }

    user.roles.push(role);
    user.role = resolveBinaryRole(undefined, user.roles);
    await this.repo.save(user);

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }

  async updateUserRoles(userId: string, roleIds: string[]) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.roleRepo.find({
      where: { id: In(roleIds) },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more roles not found');
    }

    user.roles = roles;
    user.role = resolveBinaryRole(undefined, roles);
    await this.repo.save(user);

    return {
      id: user.id,
      email: user.email,
      roles: roles,
    };
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');

    const hasRole = user.roles.some((r) => r.id === roleId);
    if (!hasRole) {
      throw new BadRequestException('User does not have this role');
    }

    if (user.roles.length === 1) {
      throw new BadRequestException('User must have at least one role');
    }

    user.roles = user.roles.filter((r) => r.id !== roleId);
    user.role = resolveBinaryRole(undefined, user.roles);
    await this.repo.save(user);

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
      select: [
        'id',
        'name',
        'email',
        'password',
        'refreshToken',
        'isActive',
        'dob',
        'address',
        'phone',
        'image',
        'role',
      ],
      relations: ['roles', 'roles.permissions'],
    });
  }

  findByLogin(identifier: string) {
    const value = identifier.trim().toLowerCase();
    return this.repo
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.refreshToken'])
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('LOWER(user.email) = :value OR LOWER(user.username) = :value', {
        value,
      })
      .getOne();
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    await this.repo.update(userId, { refreshToken });
  }

  async findById(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  }
}
