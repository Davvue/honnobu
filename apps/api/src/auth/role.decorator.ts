import { Role } from '@honnobu/shared';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'ROLES';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
