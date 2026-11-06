import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

/**
 * Tạo lớp từ scripts/data/drive-classes.json (sinh bởi fetch-drive-students.ts)
 * và thêm học viên đã có tài khoản (user.username = Mã HV) vào lớp.
 * Lớp đã tồn tại (theo code) giữ nguyên tên/mô tả, chỉ bổ sung thành viên còn thiếu.
 *
 * Usage: ts-node scripts/import-classes.ts [--env .env.neon] [--dry-run]
 */
const args = process.argv.slice(2);
const envIdx = args.indexOf('--env');
dotenv.config({ path: envIdx >= 0 ? args[envIdx + 1] : '.env' });
const dryRun = args.includes('--dry-run');

const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const DATA_FILE = path.join(__dirname, 'data', 'drive-classes.json');

interface DriveClass {
  classCode: string;
  sheet: string;
  folder: string;
  title: string;
  members: string[];
}

function className(c: DriveClass) {
  const name = c.title ? `${c.classCode} – ${c.title}` : c.sheet;
  return name.length > 200 ? name.slice(0, 197) + '...' : name;
}

async function main() {
  if (!url) throw new Error('Missing DATABASE_URL / NEON_DATABASE_URL');
  const classes: DriveClass[] = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const host = new URL(url).hostname;
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host);
  console.log(`Target DB: ${host}${dryRun ? ' (dry-run)' : ''}`);
  console.log(`Classes in file: ${classes.length}`);

  const ds = new DataSource({
    type: 'postgres',
    url,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  await ds.initialize();

  const users: { id: string; username: string }[] = await ds.query(
    `SELECT id, username FROM "user"
     WHERE username IS NOT NULL AND is_active = true AND delete_at IS NULL`,
  );
  const userByCode = new Map(users.map((u) => [u.username.toLowerCase(), u.id]));

  const runner = ds.createQueryRunner();
  await runner.startTransaction();
  let createdClasses = 0;
  let addedMembers = 0;
  const unmatched = new Set<string>();
  const skipped: string[] = [];
  try {
    for (const c of classes) {
      const existing: { id: string; delete_at: Date | null }[] = await runner.query(
        `SELECT id, delete_at FROM classes WHERE code = $1`,
        [c.classCode],
      );
      let classId: string;
      if (existing.length) {
        if (existing[0].delete_at) {
          skipped.push(`${c.classCode} (đã bị xóa)`);
          continue;
        }
        classId = existing[0].id;
      } else {
        const description = [c.title, `Nguồn Drive: ${c.folder ? c.folder + '/' : ''}${c.sheet}`]
          .filter(Boolean)
          .join('\n');
        const rows: { id: string }[] = await runner.query(
          `INSERT INTO classes (code, name, description, source)
           VALUES ($1, $2, $3, 'drive') RETURNING id`,
          [c.classCode, className(c), description],
        );
        classId = rows[0].id;
        createdClasses++;
      }

      const userIds = c.members
        .map((code) => {
          const id = userByCode.get(code.toLowerCase());
          if (!id) unmatched.add(code);
          return id;
        })
        .filter((id): id is string => !!id);
      let added = 0;
      if (userIds.length) {
        const res: { id: string }[] = await runner.query(
          `INSERT INTO class_members (class_id, user_id)
           SELECT $1, unnest($2::uuid[])
           ON CONFLICT (class_id, user_id) DO NOTHING
           RETURNING id`,
          [classId, userIds],
        );
        added = res.length;
        addedMembers += added;
      }
      console.log(
        `  ${existing.length ? '=' : '+'} ${c.classCode}: ${c.members.length} HV trong sheet, thêm ${added}`,
      );
    }

    await runner.query(
      `INSERT INTO class_audit_logs (action, actor_name, detail) VALUES ('import', $1, $2)`,
      [
        'script:import-classes',
        JSON.stringify({ createdClasses, addedMembers, unmatched: [...unmatched] }),
      ],
    );

    if (dryRun) await runner.rollbackTransaction();
    else await runner.commitTransaction();
  } catch (err) {
    await runner.rollbackTransaction();
    throw err;
  } finally {
    await runner.release();
    await ds.destroy();
  }

  console.log(`\nLớp mới: ${createdClasses}, thành viên thêm: ${addedMembers}`);
  if (skipped.length) console.log(`Bỏ qua: ${skipped.join(', ')}`);
  if (unmatched.size) {
    console.log(`Mã HV chưa có tài khoản (${unmatched.size}): ${[...unmatched].join(', ')}`);
  }
  if (dryRun) console.log('Dry-run: đã rollback, không ghi gì vào DB.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
