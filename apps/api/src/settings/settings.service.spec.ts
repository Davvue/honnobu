import { SettingsService } from './settings.service';
import { Setting, SettingType } from '../database/entities/setting.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SETTING_DEFINITIONS } from './settings.definitions';

describe('SettingsService', () => {
  type OrUpdateArgs = [
    overwrite: string[],
    conflictTarget: string[],
    options?: { skipUpdateIfNoValuesChanged?: boolean },
  ];

  type QueryBuilderMock = {
    insert: jest.Mock<QueryBuilderMock, []>;
    into: jest.Mock<QueryBuilderMock, [unknown]>;
    values: jest.Mock<QueryBuilderMock, [unknown]>;
    orUpdate: jest.Mock<QueryBuilderMock, OrUpdateArgs>;
    execute: jest.Mock<Promise<unknown>, []>;
  };

  let service: SettingsService;
  let findMock: jest.Mock;
  let queryBuilder: QueryBuilderMock;

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

    queryBuilder = {
      insert: jest.fn<QueryBuilderMock, []>(() => queryBuilder),
      into: jest.fn<QueryBuilderMock, [unknown]>(() => queryBuilder),
      values: jest.fn<QueryBuilderMock, [unknown]>(() => queryBuilder),
      orUpdate: jest.fn<QueryBuilderMock, OrUpdateArgs>(() => queryBuilder),
      execute: jest.fn<Promise<unknown>, []>().mockResolvedValue({
        identifiers: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getRepositoryToken(Setting),
          useValue: {
            find: findMock,
            createQueryBuilder: (): QueryBuilderMock => queryBuilder,
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);

    await service.onModuleInit();
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

  describe('seeding', () => {
    it('upserts every definition on init', async () => {
      await createService();
      expect(queryBuilder.values).toHaveBeenCalledWith([
        ...SETTING_DEFINITIONS,
      ]);
    });

    it('refreshes metadata but never the stored value', async () => {
      await createService();

      const [overwrite, conflictTarget] = queryBuilder.orUpdate.mock.calls[0];

      expect(overwrite).not.toContain('value');
      expect(overwrite).toEqual(
        expect.arrayContaining([
          'type',
          'description_key',
          'group',
          'subgroup',
          'order_index',
        ])
      );
      expect(conflictTarget).toEqual(['key']);
    });

    it('skips the write when nothing in the definitions changed', async () => {
      await createService();

      const [, , options] = queryBuilder.orUpdate.mock.calls[0];

      expect(options?.skipUpdateIfNoValuesChanged).toBe(true);
    });

    it('seeds before loading, so new definitions land in the map', async () => {
      await createService([
        buildSetting({
          key: 'SignupEnabled',
          value: 'false',
          type: SettingType.BOOLEAN,
        }),
      ]);

      expect(queryBuilder.values).toHaveBeenCalled();
      expect(service.get<boolean>('SignupEnabled')).toBe(false);
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
