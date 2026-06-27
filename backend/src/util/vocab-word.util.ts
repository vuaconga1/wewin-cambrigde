export function normalizeWord(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function wordToSlug(value: string): string {
  return normalizeWord(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function approvedImagePublicPath(slug: string): string {
  return `/assets/vocab/approved/${slug}.png`;
}

export function pendingImagePublicPath(slug: string): string {
  return `/assets/vocab/pending/${slug}.png`;
}

export function rejectedImagePublicPath(slug: string): string {
  return `/assets/vocab/rejected/${slug}.png`;
}