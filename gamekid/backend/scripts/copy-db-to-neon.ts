import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

dotenv.config({ path: path.join(__dirname, '../.env') });

const SOURCE_URL =
  process.env.SOURCE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:123123@localhost:5432/wewin_db';

const neonEnvPath = path.join(__dirname, '../.env.neon');
const neonEnv = fs.existsSync(neonEnvPath)
  ? dotenv.parse(fs.readFileSync(neonEnvPath))
  : {};
const TARGET_URL =
  process.env.NEON_DATABASE_URL || neonEnv.NEON_DATABASE_URL || neonEnv.DATABASE_URL;

const TABLES_IN_ORDER = [
  'permission',
  'role',
  'role_permissions_permission',
  'user',
  'user_roles_role',
  'student',
  'game_units',
  'vocabulary_items',
  'vocab_images',
  'game_progress',
  'game_score',
  'migrations',
];

async function getTables(client: Client): Promise<string[]> {
  const result = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
  );
  return result.rows.map((row: { tablename: string }) => row.tablename);
}

async function copyTable(
  source: Client,
  target: Client,
  table: string,
): Promise<number> {
  const { rows } = await source.query(`SELECT * FROM "${table}"`);
  if (rows.length === 0) {
    console.log(`- ${table}: 0 rows`);
    return 0;
  }

  const columns = Object.keys(rows[0]);
  const columnList = columns.map((c) => `"${c}"`).join(', ');
  const chunkSize = 50;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const values: unknown[] = [];
    const placeholders = chunk
      .map((row, rowIndex) => {
        const base = rowIndex * columns.length;
        columns.forEach((col) => values.push(row[col]));
        const slot = columns.map((_, colIndex) => `$${base + colIndex + 1}`);
        return `(${slot.join(', ')})`;
      })
      .join(', ');

    await target.query(
      `INSERT INTO "${table}" (${columnList}) VALUES ${placeholders}`,
      values,
    );
  }

  console.log(`- ${table}: ${rows.length} rows`);
  return rows.length;
}

async function main() {
  if (!TARGET_URL) {
    console.error(
      'Missing NEON_DATABASE_URL. Create backend/.env.neon with:\nNEON_DATABASE_URL=postgresql://...neon...?sslmode=require',
    );
    process.exit(1);
  }

  if (SOURCE_URL === TARGET_URL) {
    console.error('Source and target database URLs must be different.');
    process.exit(1);
  }

  const source = new Client({ connectionString: SOURCE_URL });
  const target = new Client({
    connectionString: TARGET_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Copying data from local Postgres to Neon...\n');

  await source.connect();
  await target.connect();

  const sourceTables = await getTables(source);
  const targetTables = await getTables(target);
  const ordered = [
    ...TABLES_IN_ORDER.filter((t) => sourceTables.includes(t)),
    ...sourceTables.filter((t) => !TABLES_IN_ORDER.includes(t)),
  ].filter((t) => targetTables.includes(t));

  if (ordered.length === 0) {
    throw new Error('No matching tables found on target database.');
  }

  await target.query(
    `TRUNCATE TABLE ${ordered
      .slice()
      .reverse()
      .map((t) => `"${t}"`)
      .join(', ')} RESTART IDENTITY CASCADE`,
  );

  let total = 0;
  for (const table of ordered) {
    total += await copyTable(source, target, table);
  }

  console.log(`\nDone. Copied ${total} rows total.`);
  await source.end();
  await target.end();
}

main().catch((error) => {
  console.error('Copy failed:', error);
  process.exit(1);
});