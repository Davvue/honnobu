import { AccessTokenPayload } from './TokenPayload';

export interface HonRequest extends Request {
  user: AccessTokenPayload;
}
