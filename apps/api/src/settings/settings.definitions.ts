import { Setting, SettingType } from '../database/entities/setting.entity';

type SettingDefinition = Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>;

export const SETTING_DEFINITIONS = [
  {
    key: 'SignupEnabled',
    value: 'false',
    type: SettingType.BOOLEAN,
    descriptionKey: 'signupEnabled',
    group: 'auth',
    subgroup: 'capabilities',
    orderIndex: 0,
  },
  {
    key: 'RefreshExpiryDays',
    value: '30',
    type: SettingType.INTEGER,
    descriptionKey: 'refreshExpiryDays',
    group: 'auth',
    subgroup: 'expiry',
    orderIndex: 0,
  },
] as const satisfies readonly SettingDefinition[];

export type SettingKey = (typeof SETTING_DEFINITIONS)[number]['key'];
