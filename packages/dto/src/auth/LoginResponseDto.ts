import { Role } from '@honnobu/shared';

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  id: string;
  username: string;
  displayName: string;
  roles: Role[];
}
