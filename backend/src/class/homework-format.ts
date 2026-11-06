const VN_DATE_TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** "05/11/2026 17:00" theo giờ Việt Nam */
export function formatVnDateTime(date: Date) {
  const p = Object.fromEntries(
    VN_DATE_TIME.formatToParts(date).map((x) => [x.type, x.value]),
  );
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

export function assignmentTitle(a: {
  bookName: string;
  unitName: string;
  partTitle?: string | null;
}) {
  return [a.bookName, a.unitName, a.partTitle].filter(Boolean).join(' · ');
}

// Chống chèn công thức khi mở CSV bằng Excel
function csvCell(value: unknown) {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV UTF-8 có BOM để Excel đọc đúng tiếng Việt */
export function toCsv(rows: unknown[][]) {
  return '\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
}
