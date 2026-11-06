import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from 'src/entities/user/user.entity';

const STAFF_ROLE_NAMES = ['ADMIN', 'TEACHER'];

export type StaffActor = { id: string; name: string };

export type StaffRequest = Request & { staff: StaffActor };

/**
 * Giáo viên / admin. Đọc lại user từ DB thay vì tin payload JWT, vì payload chỉ
 * có roleIds (uuid) chứ không có tên role.
 */
@Injectable()
export class StaffGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<StaffRequest>();
    const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Missing token');

    let sub: string;
    try {
      sub = this.jwt.verify<{ sub: string }>(token).sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userRepo.findOne({
      where: { id: sub, isActive: true },
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException();

    const isStaff =
      user.role === 1 ||
      (user.roles ?? []).some(
        (r) => !r.isDisabled && STAFF_ROLE_NAMES.includes(r.name.toUpperCase()),
      );
    if (!isStaff) throw new ForbiddenException('Chỉ giáo viên được truy cập');

    req.staff = { id: user.id, name: user.name };
    return true;
  }
}
