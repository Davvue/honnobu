import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Setting, SettingType } from '../database/entities/setting.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  private settingsMap: { [key: string]: unknown };

  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>
  ) {
    this.settingsMap = {};
    this.logger.debug('Loading settings from DB');
    this.loadSettingsFromDB()
      .then(() => {
        this.logger.debug(`Initial settings load from DB completed`);
      })
      .catch((err) => {
        this.logger.error(`Failed initial setting load: ${err}`);
      });
  }

  private async loadSettingsFromDB(): Promise<void> {
    const settings = await this.getAllEntities();

    for (const setting of settings) {
      switch (setting.type) {
        case SettingType.BOOLEAN:
          this.settingsMap[setting.key] = setting.value === 'true';
          break;
        case SettingType.JSON:
          this.settingsMap[setting.key] = JSON.parse(setting.value);
          break;
        case SettingType.INTEGER:
          this.settingsMap[setting.key] = parseInt(setting.value);
          break;
        case SettingType.FLOAT:
          this.settingsMap[setting.key] = parseFloat(setting.value);
          break;
        case SettingType.TEXT:
        case SettingType.STRING:
        default:
          this.settingsMap[setting.key] = setting.value;
      }
    }
  }

  public get<T>(key: string): T | null | undefined {
    return this.settingsMap[key] as T;
  }

  public getOrElse<T>(key: string, other: T): T {
    return (this.settingsMap[key] as T) ?? other;
  }

  public getOrThrow<T>(key: string): T {
    if (!(key in this.settingsMap)) throw new Error(`setting ${key} not found`);

    return this.settingsMap[key] as T;
  }

  public async getAllEntities(): Promise<Setting[]> {
    return this.settingsRepository.find({
      order: {
        key: 'ASC',
      },
    });
  }
}
