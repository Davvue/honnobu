import { Role } from '@honnobu/shared';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'ROLES';
export const Roles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
