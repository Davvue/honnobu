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
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../database/entities/token.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import dayjs from 'dayjs';

interface TokenIds {
  sessionId: string;
  accessTokenId: string;
  refreshTokenId: string;
}

@Injectable()
export class AuthService {
  // TODO: Move to settings
  private readonly refreshExpiryDays = 30;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>
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

    await this.saveRefreshToken(tokens.refreshToken, ids, user);

    this.logger.log(`user ${user.id} logging in`);
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      roles: user.roles,
      ...tokens,
    };
  }

  public async refresh() {}

  public async signUp() {}

  public async signOut() {}

  private async saveRefreshToken(
    refreshToken: string,
    ids: TokenIds,
    user: User
  ): Promise<void> {
    try {
      const tokenEntity = this.refreshTokenRepository.create({
        id: ids.refreshTokenId,
        sessionId: ids.sessionId,
        user,
        tokenHash: crypto
          .createHash('sha256')
          .update(refreshToken)
          .digest('hex'),
        expiresAt: dayjs().add(this.refreshExpiryDays, 'days').toISOString(),
        revokedAt: null,
      });
      await this.refreshTokenRepository.save(tokenEntity);
    } catch (err) {
      this.logger.error(
        `Failed to write refresh token to db: ${err instanceof Error ? err.message : String(err)}`
      );
    }
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
