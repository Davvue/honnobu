import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SettingType {
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  FLOAT = 'FLOAT',
  JSON = 'JSON',
  BOOLEAN = 'BOOLEAN',
  TEXT = 'TEXT',
}

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  key: string;

  @Column({
    type: 'text',
  })
  value: string;

  @Column({
    type: 'enum',
    enum: SettingType,
    default: SettingType.STRING,
  })
  type: SettingType;

  @Column({
    name: 'description_key',
    type: 'varchar',
    length: 255,
  })
  descriptionKey: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: 'default',
  })
  group: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: 'default',
  })
  subgroup: string;

  @Column({
    name: 'order_index',
    type: 'int',
    default: 0,
  })
  orderIndex: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
