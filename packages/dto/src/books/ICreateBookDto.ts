import { BookFormat } from '@honnobu/shared';

export interface ICreateBookDto {
  title: string;
  subtitle?: string;
  isbn?: string;
  description?: string;
  pageCount: number;
  publisher?: string;
  publishedDate?: string;
  language: string;
  format: BookFormat;
  coverUrl?: string;
}
