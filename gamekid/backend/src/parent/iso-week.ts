export type IsoWeekWindow = {
  weekKey: string;
  isoWeek: number;
  weekYear: number;
  rangeLabel: string;
  start: Date;
  end: Date;
};

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function hoChiMinhLocalToUtc(
  year: number,
  month: number,
  day: number,
): Date {
  return new Date(Date.UTC(year, month - 1, day, -7, 0, 0, 0));
}

export function getIsoWeekAndYear(
  year: number,
  month: number,
  day: number,
): { weekYear: number; isoWeek: number } {
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const weekYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const isoWeek = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { weekYear, isoWeek };
}

export function getIsoWeeksInYear(weekYear: number): number {
  return getIsoWeekAndYear(weekYear, 12, 28).isoWeek;
}

function mondayOfIsoWeek(weekYear: number, isoWeek: number) {
  const jan4 = new Date(Date.UTC(weekYear, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7;
  const monday = new Date(
    Date.UTC(weekYear, 0, 4 - (jan4Dow - 1) + (isoWeek - 1) * 7),
  );
  return {
    year: monday.getUTCFullYear(),
    month: monday.getUTCMonth() + 1,
    day: monday.getUTCDate(),
  };
}

export function resolveIsoWeekWindow(
  weekYear: number,
  isoWeek: number,
): IsoWeekWindow | null {
  if (!Number.isInteger(weekYear) || !Number.isInteger(isoWeek)) return null;
  if (isoWeek < 1 || isoWeek > getIsoWeeksInYear(weekYear)) return null;

  const monday = mondayOfIsoWeek(weekYear, isoWeek);
  const sundayDate = new Date(
    Date.UTC(monday.year, monday.month - 1, monday.day + 6),
  );
  const nextMonday = new Date(
    Date.UTC(monday.year, monday.month - 1, monday.day + 7),
  );
  const startLabel =
    monday.year === sundayDate.getUTCFullYear()
      ? `${pad2(monday.day)}/${pad2(monday.month)}`
      : `${pad2(monday.day)}/${pad2(monday.month)}/${monday.year}`;

  return {
    weekKey: `${weekYear}-W${pad2(isoWeek)}`,
    isoWeek,
    weekYear,
    rangeLabel: `${startLabel} – ${pad2(sundayDate.getUTCDate())}/${pad2(sundayDate.getUTCMonth() + 1)}/${sundayDate.getUTCFullYear()}`,
    start: hoChiMinhLocalToUtc(monday.year, monday.month, monday.day),
    end: hoChiMinhLocalToUtc(
      nextMonday.getUTCFullYear(),
      nextMonday.getUTCMonth() + 1,
      nextMonday.getUTCDate(),
    ),
  };
}

export function parseIsoWeekKey(
  value: string | null | undefined,
): IsoWeekWindow | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(String(value || '').trim());
  if (!match) return null;
  return resolveIsoWeekWindow(Number(match[1]), Number(match[2]));
}

export function parseIsoWeekYearAndWeek(
  yearValue: string | null | undefined,
  weekValue: string | null | undefined,
): IsoWeekWindow | null {
  const yearRaw = String(yearValue || '').trim();
  const weekRaw = String(weekValue || '').trim();
  if (!/^\d{4}$/.test(yearRaw) || !/^\d{1,2}$/.test(weekRaw)) return null;
  return resolveIsoWeekWindow(Number(yearRaw), Number(weekRaw));
}

export function parseParentWeekQuery(query: {
  weekKey?: string;
  week?: string;
  year?: string;
}): IsoWeekWindow | null {
  if (query.weekKey !== undefined) {
    return parseIsoWeekKey(query.weekKey);
  }
  return parseIsoWeekYearAndWeek(query.year, query.week);
}
