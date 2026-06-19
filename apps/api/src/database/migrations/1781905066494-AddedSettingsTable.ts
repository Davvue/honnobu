import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedSettingsTable1781905066494 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TYPE "public"."settings_type_enum" AS ENUM('STRING', 'INTEGER', 'FLOAT', 'JSON', 'BOOLEAN', 'TEXT')`
    );
    await queryRunner.query(
      `CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(255) NOT NULL, "value" text NOT NULL, "type" "public"."settings_type_enum" NOT NULL DEFAULT 'STRING', "description_key" character varying(255) NOT NULL, "group" character varying(255) NOT NULL DEFAULT 'default', "subgroup" character varying(255) NOT NULL DEFAULT 'default', "order_index" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c8639b7626fa94ba8265628f214" UNIQUE ("key"), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TYPE "public"."settings_type_enum"`);
  }
}
