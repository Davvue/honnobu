import { ISignupDto } from '../auth';

export interface ICreateUserDto extends ISignupDto {
  email?: string;
}
