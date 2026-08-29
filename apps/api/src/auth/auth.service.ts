import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import {
  LoginResponseDto,
  LogoutEverywhereResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
  SignupResponseDto,
} from '@honnobu/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../database/entities/token.entity';
import { IsNull, Repository } from 'typeorm';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { RefreshDto } from './dto/refresh.dto';
import { SignupDto } from './dto/signup.dto';

interface TokenIds {
  sessionId: string;
  accessTokenId: string;
  refreshTokenId: string;
}

@Injectable()
export class AuthService {
  // TODO: Move to settings
  private readonly refreshExpiryDays = 30;
  // TODO: Move to settings
  private readonly signupEnabled: boolean = false;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  public async signup(signupDto: SignupDto): Promise<SignupResponseDto> {
    const isSignupEnabled = this.signupEnabled; // TODO: Fetch from settings
    if (!isSignupEnabled) throw new ForbiddenException('signup is disabled');

    const ids = this.generateIds();

    const user = await this.usersService.create(signupDto);

    const tokens = this.generateTokens(user, ids);
    await this.saveRefreshToken(tokens.refreshToken, ids, user);

    this.logger.log(`user ${user.id} signed up, continuing with login`);
    return {
      id: user.id,
      ...tokens,
    };
  }

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
        secret: Buffer.from(
          this.configService.getOrThrow<string>('AUTH_SECRET')
        ),
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

  public async refresh(refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    let tokenPayload: AuthTokenPayload;

    try {
      tokenPayload = await this.jwtService.verifyAsync(refreshDto.refreshToken);
    } catch {
      throw new UnauthorizedException();
    }

    if (tokenPayload.tokenType !== 'refresh_token')
      throw new UnauthorizedException(
        `Got token type ${tokenPayload.tokenType}, expected 'refresh_token'`
      );

    const dbToken = await this.refreshTokenRepository.findOne({
      where: {
        id: tokenPayload.jti,
        sessionId: tokenPayload.sid,
      },
      relations: { user: true },
    });

    if (dbToken == null)
      throw new UnauthorizedException(`refresh token not found in db`);
    if (dbToken.revokedAt != null)
      throw new UnauthorizedException(`refresh token revoked`);
    if (dbToken.user.id !== tokenPayload.sub)
      throw new ForbiddenException(`refresh token belongs to different user`);

    if (dayjs(dbToken.expiresAt).isBefore(dayjs()))
      throw new UnauthorizedException(`refresh token already expired`);

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshDto.refreshToken)
      .digest('hex');

    if (dbToken.tokenHash !== tokenHash)
      throw new UnauthorizedException(`refresh token hash mismatch`);

    try {
      await this.refreshTokenRepository.save({
        ...dbToken,
        revokedAt: dayjs().toISOString(),
      });
    } catch {
      this.logger.error('Failed to revoke refresh token on refresh attempt');
      throw new InternalServerErrorException();
    }

    const ids = this.generateIds();
    const tokens = this.generateTokens(dbToken.user, {
      ...ids,
      sessionId: dbToken.sessionId,
    });

    return {
      id: dbToken.user.id,
      ...tokens,
    };
  }

  public async logoutSession(
    tokenPayload: AccessTokenPayload,
    sessionId: string
  ): Promise<LogoutResponseDto> {
    const session = await this.refreshTokenRepository.findOne({
      where: {
        user: { id: tokenPayload.sub },
        sessionId: sessionId,
        revokedAt: IsNull(),
      },
    });

    if (session == null)
      throw new NotFoundException(`session does not exist or already revoked`);

    session.revokedAt = new Date();

    await this.refreshTokenRepository.save(session);

    return {
      sessionId: session.id,
    };
  }

  public async logoutEverywhere(
    tokenPayload: AccessTokenPayload
  ): Promise<LogoutEverywhereResponseDto> {
    await this.refreshTokenRepository.update(
      {
        user: { id: tokenPayload.sub },
        revokedAt: IsNull(),
      },
      { revokedAt: new Date() }
    );

    return { success: true };
  }

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
