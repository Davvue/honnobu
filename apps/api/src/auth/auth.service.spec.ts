import { AuthService } from './auth.service';
import { TestBed } from '@suites/unit';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(AuthService).compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
