import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { Setting, SettingType } from '../database/entities/setting.entity';

describe('SettingsService', () => {
  let service: SettingsService;
  let findMock: jest.Mock;

  const buildSetting = (overrides: Partial<Setting>): Setting => ({
    id: 'id',
    key: 'key',
    value: 'value',
    type: SettingType.STRING,
    descriptionKey: 'description',
    group: 'default',
    subgroup: 'default',
    orderIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createService = async (settings: Setting[] = []): Promise<void> => {
    findMock = jest.fn<Promise<Setting[]>, []>().mockResolvedValue(settings);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getRepositoryToken(Setting),
          useValue: {
            find: findMock,
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);

    // the constructor kicks off an async DB load; flush it before each test runs
    await new Promise((res) => process.nextTick(res));
  };

  it('should be defined', async () => {
    await createService();
    expect(service).toBeDefined();
  });

  it('loads settings from the repository ordered by key', async () => {
    await createService();
    expect(findMock).toHaveBeenCalledWith({
      order: { key: 'ASC' },
    });
  });

  it('parses BOOLEAN settings', async () => {
    await createService([
      buildSetting({ key: 'flag', value: 'true', type: SettingType.BOOLEAN }),
    ]);
    expect(service.get<boolean>('flag')).toBe(true);
  });

  it('parses JSON settings', async () => {
    await createService([
      buildSetting({ key: 'config', value: '{"a":1}', type: SettingType.JSON }),
    ]);
    expect(service.get<object>('config')).toEqual({ a: 1 });
  });

  it('parses INTEGER settings', async () => {
    await createService([
      buildSetting({ key: 'count', value: '42', type: SettingType.INTEGER }),
    ]);
    expect(service.get<number>('count')).toBe(42);
  });

  it('parses FLOAT settings', async () => {
    await createService([
      buildSetting({ key: 'ratio', value: '3.14', type: SettingType.FLOAT }),
    ]);
    expect(service.get<number>('ratio')).toBeCloseTo(3.14);
  });

  it('keeps STRING and TEXT settings as raw strings', async () => {
    await createService([
      buildSetting({ key: 'name', value: 'honnobu', type: SettingType.STRING }),
      buildSetting({
        key: 'notes',
        value: 'some text',
        type: SettingType.TEXT,
      }),
    ]);
    expect(service.get<string>('name')).toBe('honnobu');
    expect(service.get<string>('notes')).toBe('some text');
  });

  describe('get', () => {
    it('returns undefined for an unknown key', async () => {
      await createService();
      expect(service.get('missing')).toBeUndefined();
    });
  });

  describe('getOrElse', () => {
    it('returns the stored value when present', async () => {
      await createService([
        buildSetting({
          key: 'name',
          value: 'honnobu',
          type: SettingType.STRING,
        }),
      ]);
      expect(service.getOrElse('name', 'fallback')).toBe('honnobu');
    });

    it('returns the fallback when the key is missing', async () => {
      await createService();
      expect(service.getOrElse('missing', 'fallback')).toBe('fallback');
    });
  });

  describe('getOrThrow', () => {
    it('returns the stored value when present', async () => {
      await createService([
        buildSetting({ key: 'count', value: '42', type: SettingType.INTEGER }),
      ]);
      expect(service.getOrThrow<number>('count')).toBe(42);
    });

    it('throws when the key is missing', async () => {
      await createService();
      expect(() => service.getOrThrow('missing')).toThrow(
        'setting missing not found'
      );
    });
  });

  describe('getAllEntities', () => {
    it('delegates to the repository', async () => {
      const settings = [buildSetting({ key: 'a' }), buildSetting({ key: 'b' })];
      await createService(settings);
      findMock.mockResolvedValueOnce(settings);

      const result = await service.getAllEntities();

      expect(result).toEqual(settings);
      expect(findMock).toHaveBeenCalledWith({
        order: { key: 'ASC' },
      });
    });
  });
});
