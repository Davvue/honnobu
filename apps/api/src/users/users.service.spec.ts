import { UsersService } from './users.service';
import { TestBed } from '@suites/unit';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(UsersService).compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
