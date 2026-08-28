import { TokenResponseDto } from './TokenResponseDto';

export interface RefreshResponseDto extends TokenResponseDto {
  id: string;
}
