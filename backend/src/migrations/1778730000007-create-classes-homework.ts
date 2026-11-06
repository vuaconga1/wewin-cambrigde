import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClassesHomework1778730000007 implements MigrationInterface {
  name = 'CreateClassesHomework1778730000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "classes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "code" varchar(40) UNIQUE,
        "name" varchar(200) NOT NULL,
        "description" text,
        "source" varchar(20) NOT NULL DEFAULT 'manual',
        "created_by" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "create_at" timestamp NOT NULL DEFAULT now(),
        "update_at" timestamp NOT NULL DEFAULT now(),
        "delete_at" timestamp
      )`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "class_members" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "class_id" uuid NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "added_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_class_members_class_user" UNIQUE ("class_id", "user_id")
      )`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_class_members_user" ON "class_members" ("user_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "class_assignments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "class_id" uuid NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
        "book_type" varchar(40) NOT NULL,
        "unit_slug" varchar(80) NOT NULL,
        "part_id" varchar(40) NOT NULL,
        "game_types" text NOT NULL,
        "book_name" varchar(120) NOT NULL,
        "unit_name" varchar(200) NOT NULL,
        "part_title" varchar(200),
        "deadline_at" timestamptz NOT NULL,
        "created_by" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_class_assignments_class_deadline" ON "class_assignments" ("class_id", "deadline_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "game_attempts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "player_id" varchar(50) NOT NULL,
        "student_id" uuid REFERENCES "student"("id") ON DELETE SET NULL,
        "unit_slug" varchar(80) NOT NULL,
        "part_id" varchar(40) NOT NULL,
        "game_type" varchar(40) NOT NULL,
        "book_type" varchar(40),
        "score" int NOT NULL,
        "max_score" int,
        "item_count" int,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_game_attempts_lookup" ON "game_attempts" ("player_id", "unit_slug", "part_id", "game_type", "created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "class_audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "action" varchar(40) NOT NULL,
        "actor_id" uuid,
        "actor_name" varchar(200),
        "class_id" uuid,
        "assignment_id" uuid,
        "detail" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_class_audit_logs_class" ON "class_audit_logs" ("class_id", "created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "class_audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "game_attempts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "class_assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "class_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "classes"`);
  }
}
