import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  LoginResponseDto,
  LogoutEverywhereResponseDto,
  LogoutResponseDto,
  LogoutSessionResponseDto,
  RefreshResponseDto,
} from '@honnobu/dto';
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
  async refresh(@Body() refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: HonRequest): Promise<LogoutResponseDto> {
    return this.authService.logout(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout/:sessionId')
  async logoutSession(
    @Req() req: HonRequest,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string
  ): Promise<LogoutSessionResponseDto> {
    return await this.authService.logoutSession(req.user, sessionId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout-everywhere')
  async logoutEverywhere(
    @Req() req: HonRequest
  ): Promise<LogoutEverywhereResponseDto> {
    return this.authService.logoutEverywhere(req.user);
  }
}
