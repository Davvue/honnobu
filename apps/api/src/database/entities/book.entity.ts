import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookFormat } from '@honnobu/shared';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    name: 'subtitle',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  subtitle: string | null;

  @Column({
    name: 'isbn',
    type: 'varchar',
    length: 13,
    nullable: true,
    unique: true,
  })
  isbn: string | null;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'page_count',
    type: 'int',
  })
  pageCount: number;

  @Column({
    name: 'publisher',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  publisher: string | null;

  @Column({
    name: 'published_date',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  publishedDate: string | null;

  @Column({
    name: 'language',
    type: 'varchar',
    length: 35,
  })
  language: string;

  @Column({
    name: 'format',
    type: 'enum',
    enum: BookFormat,
    enumName: 'enum_book_format',
  })
  format: BookFormat;

  @Column({
    name: 'cover_path',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  coverPath: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
