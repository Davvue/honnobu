import { ISignInDto } from '@honnobu/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto implements ISignInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
