import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

/**
 * Tạo hàng loạt tài khoản học viên từ scripts/data/drive-students.json
 * (sinh bởi fetch-drive-students.ts).
 *   username = Mã HV, name = Họ tên, password = DEFAULT_PASSWORD, role = 0
 *
 * Usage: ts-node scripts/create-student-accounts.ts [--dry-run] [--env .env.neon]
 */

const DEFAULT_PASSWORD = '123';
const DATA_FILE = path.join(__dirname, 'data', 'drive-students.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const envIdx = args.indexOf('--env');
dotenv.config({ path: envIdx >= 0 ? args[envIdx + 1] : '.env' });

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

function cleanName(name: string) {
  // Bỏ ghi chú lịch học kiểu "Nguyễn An Nhiên - chỉ học CN"
  return name.split(' - ')[0].replace(/\s+/g, ' ').trim();
}

async function main() {
  if (!databaseUrl) throw new Error('Missing DATABASE_URL / NEON_DATABASE_URL');

  const raw: { code: string; name: string }[] = JSON.parse(
    fs.readFileSync(DATA_FILE, 'utf8'),
  );

  const seen = new Set<string>();
  const students = raw
    .map((s) => ({ username: s.code.trim(), name: cleanName(s.name) }))
    .filter((s) => /^[\w-]+$/.test(s.username) && s.name && !s.name.startsWith('#'))
    .filter((s) => {
      const key = s.username.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const host = new URL(databaseUrl).host;
  console.log(`Target DB: ${host}`);
  console.log(`Students in file: ${raw.length}, valid: ${students.length}`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: /localhost|127\.0\.0\.1/.test(host) ? false : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query('BEGIN');

    await client.query(`ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL`);
    await client.query(
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" varchar(50)`,
    );
    await client.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_username" ON "user" ("username")`,
    );

    const { rows: existingRows } = await client.query<{ username: string }>(
      `SELECT LOWER(username) AS username FROM "user" WHERE username IS NOT NULL`,
    );
    const existing = new Set(existingRows.map((r) => r.username));
    const toCreate = students.filter((s) => !existing.has(s.username.toLowerCase()));

    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    for (const s of toCreate) {
      await client.query(
        `INSERT INTO "user" (name, username, email, password, role)
         VALUES ($1, $2, NULL, $3, 0)`,
        [s.name, s.username, hash],
      );
    }

    console.log(`Already existed: ${students.length - toCreate.length}`);
    console.log(`Created: ${toCreate.length}`);

    if (dryRun) {
      await client.query('ROLLBACK');
      console.log('Dry run: rolled back, nothing saved.');
    } else {
      await client.query('COMMIT');
      console.log('Committed.');
    }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
