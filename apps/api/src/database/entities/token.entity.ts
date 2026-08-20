import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
@Index('IDX_REFRESH_TOKENS_USER_ID', ['user'])
@Index('IDX_REFRESH_TOKENS_SESSION_ID', ['sessionId'])
@Index('IDX_REFRESH_TOKENS_EXPIRES_AT', ['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;

  @Column({
    name: 'session_id',
    type: 'uuid',
  })
  sessionId: string;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 255,
  })
  tokenHash: string;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt: Date;

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
