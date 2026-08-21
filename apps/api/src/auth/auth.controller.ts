import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from '@honnobu/dto';
import type { HonRequest } from '../types/HonRequest';
import { RefreshDto } from './dto/refresh.dto';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.signIn(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() _refreshDto: RefreshDto) {}

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() _req: HonRequest) {}
}
