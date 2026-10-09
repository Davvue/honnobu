import { ICreateBookDto } from '@honnobu/dto';
import { BookFormat } from '@honnobu/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsISBN,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto implements ICreateBookDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string | undefined;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISBN()
  isbn?: string | undefined;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | undefined;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  pageCount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  publisher?: string | undefined;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}(-\d{2})?(-\d{2})?$/, {
    message: 'publishedDate must be formatted as YYYY[-MM][-DD]',
  })
  publishedDate?: string | undefined;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(35)
  language: string;

  @ApiProperty({ enum: BookFormat })
  @IsNotEmpty()
  @IsEnum(BookFormat)
  format: BookFormat;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  coverUrl?: string | undefined;
}
