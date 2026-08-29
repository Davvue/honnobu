import { Role } from '@honnobu/shared';

export interface TokenBasePayload {
  /**
   * The token subject's id. Consistent across all tokens issued for the same subject
   */
  sub: string;

  /**
   * The token id.
   */
  jti: string;

  /**
   * The session id. Consistent across all tokens belonging to the same session
   */
  sid: string;
}

/**
 * User access token payload
 */
export interface AccessTokenPayload extends TokenBasePayload {
  tokenType: 'access_token';
  username: string;
  roles: Role[];
}

/**
 * User refresh token payload
 */
export interface RefreshTokenPayload extends TokenBasePayload {
  tokenType: 'refresh_token';
}

/**
 * An auth user token payload.
 */
export type AuthTokenPayload = AccessTokenPayload | RefreshTokenPayload;
