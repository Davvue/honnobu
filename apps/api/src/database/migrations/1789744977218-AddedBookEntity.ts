import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedBookEntity1789744977218 implements MigrationInterface {
  name = 'AddedBookEntity1789744977218';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."enum_book_format" AS ENUM('hardcover', 'paperback', 'ebook')`
    );

    await queryRunner.query(
      `CREATE TABLE "books" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "subtitle" character varying(255),
        "isbn" character varying(13),
        "description" text,
        "page_count" integer NOT NULL,
        "publisher" character varying(255),
        "published_date" character varying(10),
        "language" character varying(35) NOT NULL,
        "format" "public"."enum_book_format" NOT NULL,
        "cover_path" character varying(512),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn"),
        CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id")
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(`DROP TYPE "public"."enum_book_format"`);
  }
}
