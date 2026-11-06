import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { CreateClassesHomework1778730000007 } from '../src/migrations/1778730000007-create-classes-homework';

/**
 * Chỉ chạy migration lớp học / bài tập (idempotent).
 * Production không có bảng "migrations" nên KHÔNG dùng `typeorm migration:run`
 * (nó sẽ chạy lại toàn bộ migration từ đầu).
 *
 * Usage: ts-node scripts/migrate-homework.ts [--env .env.neon] [--down]
 */
const args = process.argv.slice(2);
const envIdx = args.indexOf('--env');
dotenv.config({ path: envIdx >= 0 ? args[envIdx + 1] : '.env' });

const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

async function main() {
  if (!url) throw new Error('Missing DATABASE_URL / NEON_DATABASE_URL');
  const host = new URL(url).hostname;
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host);
  console.log(`Target DB: ${host}`);

  const ds = new DataSource({
    type: 'postgres',
    url,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  await ds.initialize();
  const runner = ds.createQueryRunner();
  await runner.startTransaction();
  try {
    const migration = new CreateClassesHomework1778730000007();
    if (args.includes('--down')) await migration.down(runner);
    else await migration.up(runner);
    await runner.commitTransaction();
    console.log('Done.');
  } catch (err) {
    await runner.rollbackTransaction();
    throw err;
  } finally {
    await runner.release();
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
