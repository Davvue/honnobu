import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
