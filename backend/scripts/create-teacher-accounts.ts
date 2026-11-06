import { Client } from 'pg';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

/**
 * Tạo tài khoản giáo viên từ Google Sheet đăng ký giáo viên.
 *   username = tên gọi viết thường không dấu (trùng thì thêm số: hieu, hieu1, hieu2...)
 *   password = DEFAULT_PASSWORD, role = 1
 * Giáo viên đã có tài khoản (trùng email) được bỏ qua nên chạy lại an toàn.
 *
 * Usage: ts-node scripts/create-teacher-accounts.ts [--dry-run] [--env .env.neon]
 */

const DEFAULT_PASSWORD = '123123';
const SHEET_CSV =
  'https://docs.google.com/spreadsheets/d/1tu7Nvbo-kkgYnu1lyeh_NK-d7aSqRqG4fSUZHJzQa7g/export?format=csv&gid=1136865421';

// Họ đứng cuối (vd. "Xuân Hùng Nguyễn") thì tên gọi là chữ ngay trước họ
const SURNAMES = new Set(
  [
    'nguyen', 'tran', 'le', 'pham', 'hoang', 'huynh', 'phan', 'vu', 'vo', 'dang',
    'bui', 'do', 'ho', 'ngo', 'duong', 'ly', 'uong', 'truong', 'dinh', 'lam',
    'mai', 'trinh', 'cao', 'ta', 'luu', 'thai', 'ha', 'la', 'quach', 'chau',
  ],
);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const envIdx = args.indexOf('--env');
dotenv.config({ path: envIdx >= 0 ? args[envIdx + 1] : '.env' });

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows;
}

const ascii = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

function displayName(raw: string) {
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name !== name.toUpperCase()) return name;
  return name
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function givenName(name: string) {
  const words = ascii(name).split(' ').filter(Boolean);
  if (words.length === 0) return '';
  const last = words[words.length - 1];
  const surnameLast =
    words.length > 1 && SURNAMES.has(last) && !SURNAMES.has(words[0]);
  return (surnameLast ? words[words.length - 2] : last).replace(/[^a-z0-9]/g, '');
}

async function main() {
  if (!databaseUrl) throw new Error('Missing DATABASE_URL / NEON_DATABASE_URL');

  const res = await fetch(SHEET_CSV);
  if (!res.ok) throw new Error(`Không tải được sheet: HTTP ${res.status}`);
  const [header, ...rows] = parseCsv(await res.text());
  const nameCol = header.findIndex((h) => h.trim().toLowerCase() === 'name');
  const emailCol = header.findIndex((h) => h.trim().toLowerCase() === 'email');
  const phoneCol = header.findIndex((h) => h.trim().toLowerCase().startsWith('phone'));
  const addressCol = header.findIndex((h) => h.trim().toLowerCase() === 'address');

  const teachers = rows
    .map((r) => ({
      name: displayName(r[nameCol] ?? ''),
      email: (r[emailCol] ?? '').trim().toLowerCase() || null,
      phone: (r[phoneCol] ?? '').replace(/[^\d+]/g, '') || null,
      address: (r[addressCol] ?? '').replace(/\s+/g, ' ').trim() || null,
    }))
    .filter((t) => t.name);

  const host = new URL(databaseUrl).host;
  console.log(`Target DB: ${host}${dryRun ? ' (dry-run)' : ''}`);
  console.log(`Teachers in sheet: ${teachers.length}`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: /localhost|127\.0\.0\.1/.test(host) ? false : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query('BEGIN');
    const { rows: users } = await client.query<{
      username: string | null;
      email: string | null;
    }>(`SELECT LOWER(username) AS username, LOWER(email) AS email FROM "user"`);
    const takenUsernames = new Set(users.map((u) => u.username).filter(Boolean));
    const takenEmails = new Set(users.map((u) => u.email).filter(Boolean));
    const seenEmails = new Set<string>();

    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const created: string[] = [];
    const skipped: string[] = [];
    for (const t of teachers) {
      if (t.email && (takenEmails.has(t.email) || seenEmails.has(t.email))) {
        skipped.push(`${t.name} (${t.email} đã có tài khoản)`);
        continue;
      }
      if (t.email) seenEmails.add(t.email);

      const base = givenName(t.name);
      if (!base) {
        skipped.push(`${t.name} (không tách được tên)`);
        continue;
      }
      let username = base;
      for (let n = 1; takenUsernames.has(username); n++) username = `${base}${n}`;
      takenUsernames.add(username);

      await client.query(
        `INSERT INTO "user" (name, username, email, password, role, phone, address)
         VALUES ($1, $2, $3, $4, 1, $5, $6)`,
        [t.name, username, t.email, hash, t.phone, t.address],
      );
      created.push(`${username.padEnd(10)} ${t.name}`);
    }

    console.log(`\nCreated (${created.length}):`);
    created.forEach((c) => console.log('  ' + c));
    if (skipped.length) {
      console.log(`Skipped (${skipped.length}):`);
      skipped.forEach((s) => console.log('  ' + s));
    }

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
