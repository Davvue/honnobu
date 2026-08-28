import { Role } from '@honnobu/shared';
import { TokenResponseDto } from './TokenResponseDto';

export interface LoginResponseDto extends TokenResponseDto {
  id: string;
  username: string;
  displayName: string;
  roles: Role[];
}
