import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import {
  LogoutEverywhereResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
  SignInResponseDto,
  SignUpResponseDto,
} from '@honnobu/dto';
import type { HonRequest } from '../types/HonRequest';
import { RefreshDto } from './dto/refresh.dto';
import { SignUpDto } from './dto/signUp.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: HonRequest): Promise<LogoutResponseDto> {
    return this.authService.logoutSession(req.user, req.user.sid);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout/:sessionId')
  async logoutSession(
    @Req() req: HonRequest,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string
  ): Promise<LogoutResponseDto> {
    return await this.authService.logoutSession(req.user, sessionId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout-everywhere')
  async logoutEverywhere(
    @Req() req: HonRequest
  ): Promise<LogoutEverywhereResponseDto> {
    return this.authService.logoutEverywhere(req.user);
  }
}
