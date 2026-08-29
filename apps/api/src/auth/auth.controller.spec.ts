import { AuthController } from './auth.controller';
import { TestBed } from '@suites/unit';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(AuthController).compile();

    controller = unit;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
