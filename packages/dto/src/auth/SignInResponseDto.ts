import { Role } from '@honnobu/shared';
import { TokenResponseDto } from './TokenResponseDto';

export interface SignInResponseDto extends TokenResponseDto {
  id: string;
  username: string;
  displayName: string;
  roles: Role[];
}
