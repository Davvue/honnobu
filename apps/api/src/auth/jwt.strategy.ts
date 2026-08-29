import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload, AuthTokenPayload } from '../types/TokenPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  public validate(payload: AuthTokenPayload): AccessTokenPayload | false {
    if (payload.tokenType !== 'access_token') {
      this.logger.warn(`Got token type ${payload.tokenType} as access token.`);
      return false;
    }

    return payload;
  }
}
