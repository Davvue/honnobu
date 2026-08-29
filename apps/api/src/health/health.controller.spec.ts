import { HealthController } from './health.controller';
import { TestBed } from '@suites/unit';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(HealthController).compile();

    controller = unit;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
