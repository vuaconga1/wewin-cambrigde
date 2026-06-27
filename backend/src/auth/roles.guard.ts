/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Không khai báo @Roles → cho qua
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as {
      role?: number;
      roleIds?: string[];
      roles?: { name: string }[];
    };

    if (!user) {
      return false;
    }

    if (Array.isArray(user.roles) && user.roles.length > 0) {
      return requiredRoles.some((roleName) =>
        user.roles!.some((role) => role.name === roleName),
      );
    }

    if (typeof user.role === 'number') {
      const currentRole = user.role === 1 ? 'TEACHER' : 'STUDENT';
      return requiredRoles.includes(currentRole);
    }

    if (!Array.isArray(user.roleIds)) {
      return false;
    }

    // requiredRoles = role CODE / NAME
    // user.roleIds = role ID
    return requiredRoles.some((roleId) => user.roleIds!.includes(roleId));
  }
}
