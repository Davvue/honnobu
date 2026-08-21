import { IRefreshDto } from '@honnobu/dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto implements IRefreshDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
