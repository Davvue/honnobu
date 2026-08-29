import { ISignUpDto } from '../auth';

export interface ICreateUserDto extends ISignUpDto {
  email?: string;
}
