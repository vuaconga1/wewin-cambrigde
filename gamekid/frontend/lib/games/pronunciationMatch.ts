/**
 * Web Speech API often transcribes number words as digits ("eight" → "8").
 * Normalize digit transcripts to English words before comparing.
 */

const UNDER_20 = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

function cleanText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Convert 0–9999 to English words (British "and" for hundreds). */
export function numberToWords(n: number): string | null {
  if (!Number.isInteger(n) || n < 0 || n > 9999) return null;

  if (n < 20) return UNDER_20[n];

  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ones === 0 ? TENS[tens] : `${TENS[tens]} ${UNDER_20[ones]}`;
  }

  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    const head = `${UNDER_20[hundreds]} hundred`;
    if (rest === 0) return head;
    return `${head} and ${numberToWords(rest)}`;
  }

  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const head =
    thousands === 1 ? "one thousand" : `${numberToWords(thousands)} thousand`;
  if (rest === 0) return head;
  if (rest < 100) return `${head} and ${numberToWords(rest)}`;
  return `${head} ${numberToWords(rest)}`;
}

function transcriptVariants(cleanTranscript: string): string[] {
  const variants = [cleanTranscript];
  if (!/^\d+$/.test(cleanTranscript)) return variants;

  const n = Number.parseInt(cleanTranscript, 10);
  const words = numberToWords(n);
  if (words) {
    variants.push(words);
    if (n === 1000) variants.push("a thousand");
  }
  return variants;
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const longerLength = longer.length;

  const matrix: number[][] = Array.from({ length: shorter.length + 1 }, () =>
    Array(longer.length + 1).fill(0),
  );

  for (let i = 0; i <= shorter.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= longer.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= shorter.length; i++) {
    for (let j = 1; j <= longer.length; j++) {
      if (shorter.charAt(i - 1) === longer.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  const distance = matrix[shorter.length][longer.length];
  return (longerLength - distance) / longerLength;
}

/** Avoid "eight" matching inside "eighteen". */
function containsWholePhrase(haystack: string, needle: string): boolean {
  if (!needle) return false;
  if (haystack === needle) return true;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(haystack);
}

export function isPronunciationMatch(
  transcript: string,
  correctWord: string,
): boolean {
  const cleanTranscript = cleanText(transcript);
  const cleanCorrect = cleanText(correctWord);
  if (!cleanTranscript || !cleanCorrect) return false;

  const fromDigits = /^\d+$/.test(cleanTranscript);

  for (const candidate of transcriptVariants(cleanTranscript)) {
    // Digits from STT must map exactly to the target word(s).
    if (fromDigits) {
      if (candidate === cleanCorrect) return true;
      continue;
    }

    if (
      candidate === cleanCorrect ||
      containsWholePhrase(candidate, cleanCorrect) ||
      containsWholePhrase(cleanCorrect, candidate) ||
      (similarity(candidate, cleanCorrect) >= 0.6 &&
        Math.abs(candidate.length - cleanCorrect.length) <= 2)
    ) {
      return true;
    }
  }

  return false;
}
