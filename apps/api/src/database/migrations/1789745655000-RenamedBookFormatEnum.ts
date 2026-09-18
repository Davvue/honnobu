import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamedBookFormatEnum1789745655000 implements MigrationInterface {
  name = 'RenamedBookFormatEnum1789745655000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."enum_book_format" RENAME TO "books_format_enum"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."books_format_enum" RENAME TO "enum_book_format"`
    );
  }
}
