import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  async signIn(loginDto: LoginDto) {
    const user = await this.usersService.findAuthUser(loginDto.usernameOrEmail);
    if (!user) throw new UnauthorizedException(`invalid user or password`);

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

    return {
      id: user.id,
    };
  }
}
