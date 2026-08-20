import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { User } from '../database/entities/user.entity';
import {
  AccessTokenPayload,
  AuthTokenPayload,
  RefreshTokenPayload,
} from '../types/TokenPayload';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from '@honnobu/dto';

interface TokenIds {
  sessionId: string;
  accessTokenId: string;
  refreshTokenId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  public async signIn(loginDto: LoginDto): Promise<LoginResponseDto> {
    const ids = this.generateIds();
    const user = await this.usersService.findAuthUser(loginDto.usernameOrEmail);
    if (user == null)
      throw new UnauthorizedException(`invalid user or password`);

    if (user.passwordHash == null)
      throw new UnauthorizedException(`passwordless login configured`);

    const verificationResult = await argon2.verify(
      user.passwordHash,
      loginDto.password,
      {
        secret: this.configService.getOrThrow('AUTH_SECRET'),
      }
    );
    if (!verificationResult)
      throw new UnauthorizedException(`invalid user or password`);

    const tokens = this.generateTokens(user, ids);

    this.logger.log(`user ${user.id} logging in`);
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      roles: user.roles,
      ...tokens,
    };
  }

  private generateTokens(
    user: User,
    ids: TokenIds
  ): { accessToken: string; refreshToken: string } {
    const accessTokenPayload: AccessTokenPayload = {
      tokenType: 'access_token',
      sub: user.id,
      jti: ids.accessTokenId,
      sid: ids.sessionId,
      username: user.username,
      roles: user.roles,
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      tokenType: 'refresh_token',
      sub: user.id,
      jti: ids.refreshTokenId,
      sid: ids.sessionId,
    };

    return {
      accessToken: this.signToken(accessTokenPayload),
      refreshToken: this.signToken(refreshTokenPayload),
    };
  }

  private signToken(payload: AuthTokenPayload): string {
    return this.jwtService.sign(payload);
  }

  private generateIds(): TokenIds {
    return {
      sessionId: crypto.randomUUID(),
      accessTokenId: crypto.randomUUID(),
      refreshTokenId: crypto.randomUUID(),
    };
  }
}
