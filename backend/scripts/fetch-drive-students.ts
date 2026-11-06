import * as fs from 'fs';
import * as path from 'path';

const FOLDER_ID = process.argv[2] || '1OrcBkqX9NsCe4fEOZhnDiLvMqsx9XMAK';
const OUT_FILE = path.join(__dirname, 'data', 'drive-students.json');
const CLASSES_FILE = path.join(__dirname, 'data', 'drive-classes.json');

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += c;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const normalize = (s: string) =>
  s.normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

// Sheet names often carry teacher notes: "(Đã báo mã HV)", "- chỉ học CN", "_ T3", "Lớp 2 TĐ".
const cleanName = (s: string) =>
  s
    .normalize('NFC')
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s[-_]\s?|\s?[-_]\s/)[0]
    .replace(/\s+Lớp\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const isValidCode = (code: string) => /^[A-Za-z][\w-]*\d$/.test(code);

async function listSheets(
  folderId: string,
  prefix = '',
): Promise<{ id: string; title: string }[]> {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}`);
  const html = await res.text();
  const sheets: { id: string; title: string }[] = [];

  const sheetRe =
    /href="https:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]+)[^"]*"[\s\S]*?<div class="flip-entry-title">([^<]+)</g;
  let m: RegExpExecArray | null;
  while ((m = sheetRe.exec(html))) sheets.push({ id: m[1], title: prefix + m[2] });

  const folderRe =
    /href="https:\/\/drive\.google\.com\/drive\/folders\/([\w-]+)[^"]*"[\s\S]*?<div class="flip-entry-title">([^<]+)</g;
  const subfolders: { id: string; title: string }[] = [];
  while ((m = folderRe.exec(html))) subfolders.push({ id: m[1], title: m[2] });
  for (const f of subfolders) {
    sheets.push(...(await listSheets(f.id, `${prefix}${f.title}/`)));
  }
  return sheets;
}

async function main() {
  const sheets = await listSheets(FOLDER_ID);
  console.log(`Found ${sheets.length} spreadsheets`);

  const students = new Map<string, { code: string; name: string; sheet: string }>();
  const classes: {
    classCode: string;
    sheet: string;
    folder: string;
    title: string;
    members: string[];
  }[] = [];
  const conflicts: string[] = [];

  for (const sheet of sheets) {
    const res = await fetch(
      `https://docs.google.com/spreadsheets/d/${sheet.id}/export?format=csv`,
    );
    if (!res.ok) {
      console.warn(`  ! ${sheet.title}: HTTP ${res.status}`);
      continue;
    }
    const rows = parseCsv(await res.text());
    const headerIdx = rows.findIndex((r) => r.some((c) => normalize(c) === 'mã hv'));
    if (headerIdx < 0) {
      console.warn(`  ! ${sheet.title}: no "Mã HV" header`);
      continue;
    }
    const header = rows[headerIdx].map(normalize);
    const codeCol = header.indexOf('mã hv');
    const nameCol = header.findIndex((h) => h === 'họ tên' || h === 'họ và tên');

    // Dòng tiêu đề khóa học, vd. "IELTS INTENSIVE - Hồ Quốc Khánh + ..."
    const title =
      rows
        .slice(0, headerIdx)
        .flat()
        .map((c) => c.replace(/\s+/g, ' ').trim())
        .find((c) => c && c.length < 200 && !/^(GV|-)/.test(c)) ?? '';
    const slash = sheet.title.lastIndexOf('/');
    const members = new Set<string>();

    let count = 0;
    for (const r of rows.slice(headerIdx + 1)) {
      const code = (r[codeCol] || '').trim();
      const name = cleanName(r[nameCol] || '');
      if (!code || !name || !isValidCode(code)) continue;
      const key = code.toLowerCase();
      members.add(key);
      const prev = students.get(key);
      if (prev && normalize(prev.name) !== normalize(name)) {
        conflicts.push(`${code}: "${prev.name}" (${prev.sheet}) vs "${name}" (${sheet.title})`);
        if (name.length > prev.name.length) prev.name = name;
      }
      if (!prev) students.set(key, { code, name, sheet: sheet.title });
      count++;
    }
    console.log(`  ${sheet.title}: ${count} students`);

    const sheetName = sheet.title.slice(slash + 1);
    classes.push({
      classCode: sheetName.match(/WW\d+/)?.[0] ?? sheetName,
      sheet: sheetName,
      folder: slash >= 0 ? sheet.title.slice(0, slash) : '',
      title,
      members: [...members],
    });
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify([...students.values()], null, 2), 'utf8');
  fs.writeFileSync(CLASSES_FILE, JSON.stringify(classes, null, 2), 'utf8');
  console.log(`\nUnique students: ${students.size} -> ${OUT_FILE}`);
  console.log(`Classes: ${classes.length} -> ${CLASSES_FILE}`);
  if (conflicts.length) {
    console.log(`Name conflicts (${conflicts.length}):`);
    conflicts.forEach((c) => console.log('  ' + c));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
