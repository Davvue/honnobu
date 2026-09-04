import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Setting, SettingType } from '../database/entities/setting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SETTING_DEFINITIONS, SettingKey } from './settings.definitions';

/**
 * Columns to be refreshed from their definition on application boot.
 * `value` is deliberately missing as metadata refresh should not overwrite
 * user-changed values
 *
 * @type {string[]}
 */
const SEEDED_METADATA_COLUMNS = [
  'type',
  'description_key',
  'group',
  'subgroup',
  'order_index',
];

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  private readonly settingsMap: Map<SettingKey, unknown> = new Map<
    SettingKey,
    unknown
  >();

  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>
  ) {}

  public async onModuleInit(): Promise<void> {
    this.logger.debug('Initializing settings service');
    await this.seedDefinitions();
    await this.loadSettingsFromDB();
    this.logger.debug('Done initializing settings service');
  }

  /**
   * Reconciles the settings table with their definitions. New definitions get
   * inserted with their default value. Already existing definitions keep
   * their value and only refresh metadata
   *
   * @returns {Promise<void>}
   * @async
   * @private
   */
  private async seedDefinitions(): Promise<void> {
    this.logger.debug('Seeding settings table');
    const existingKeys = new Set(
      (await this.settingsRepository.find({ select: { key: true } })).map(
        (setting) => setting.key
      )
    );

    const insertedKeys = SETTING_DEFINITIONS.filter(
      (definition) => !existingKeys.has(definition.key)
    ).map((definition) => definition.key);

    await this.settingsRepository
      .createQueryBuilder()
      .insert()
      .into(Setting)
      .values([...SETTING_DEFINITIONS])
      .orUpdate(SEEDED_METADATA_COLUMNS, ['key'], {
        skipUpdateIfNoValuesChanged: true,
      })
      .execute();

    if (insertedKeys.length > 0) {
      this.logger.log(`Seeded new settings: ${insertedKeys.join(', ')}`);
    }

    const definedKeys = new Set<string>(
      SETTING_DEFINITIONS.map((definition) => definition.key)
    );
    const orphanedKeys = [...existingKeys].filter(
      (key) => !definedKeys.has(key)
    );

    if (orphanedKeys.length > 0) {
      this.logger.warn(
        `Settings without definition, left in orphaned state: ${orphanedKeys.join(', ')}`
      );
    }

    this.logger.debug(`Reconciled ${SETTING_DEFINITIONS.length} settings`);
  }

  private async loadSettingsFromDB(): Promise<void> {
    this.logger.debug('Loading settings from db');
    const settings = await this.getAllEntities();

    for (const setting of settings) {
      const key = setting.key as SettingKey;
      switch (setting.type) {
        case SettingType.BOOLEAN:
          this.settingsMap.set(key, setting.value === 'true');
          break;
        case SettingType.JSON:
          this.settingsMap.set(key, JSON.parse(setting.value));
          break;
        case SettingType.INTEGER:
          this.settingsMap.set(key, parseInt(setting.value));
          break;
        case SettingType.FLOAT:
          this.settingsMap.set(key, parseFloat(setting.value));
          break;
        case SettingType.TEXT:
        case SettingType.STRING:
          this.settingsMap.set(key, setting.value);
          break;
      }
    }

    this.logger.debug(`Loaded ${this.settingsMap.size} settings from db`);
  }

  public get<T>(key: SettingKey): T | null | undefined {
    return this.settingsMap.get(key) as T;
  }

  public getOrElse<T>(key: SettingKey, other: T): T {
    return (this.settingsMap.get(key) as T) ?? other;
  }

  public getOrThrow<T>(key: SettingKey): T {
    if (!this.settingsMap.has(key)) throw new Error(`setting ${key} not found`);

    return this.settingsMap.get(key) as T;
  }

  public async getAllEntities(): Promise<Setting[]> {
    return this.settingsRepository.find({
      order: {
        key: 'ASC',
      },
    });
  }
}
