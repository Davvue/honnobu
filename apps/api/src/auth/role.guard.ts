import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Role } from '@honnobu/shared';
import { ROLES_KEY } from './role.decorator';
import { HonRequest } from '../types/HonRequest';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles.length <= 0) return true;

    const { user } = context.switchToHttp().getRequest<HonRequest>();
    if (user == null) return false;

    for (const role of user.roles) {
      if (requiredRoles.includes(role)) return true;
    }

    this.logger.warn(
      `User ${user.username} failed role check. Needed any of ` +
        `[${requiredRoles.join(', ')}], but got [${user.roles.join(', ')}]`
    );
    return false;
  }
}
