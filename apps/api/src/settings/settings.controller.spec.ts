import { SettingsController } from './settings.controller';
import { TestBed } from '@suites/unit';

describe('SettingsController', () => {
  let controller: SettingsController;

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(SettingsController).compile();

    controller = unit;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
