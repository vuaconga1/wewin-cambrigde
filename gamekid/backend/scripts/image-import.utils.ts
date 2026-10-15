import * as fs from 'fs';
import * as path from 'path';
import { IMAGE_EXTENSIONS } from './image-path-resolver';

const REPO_ROOT = path.resolve(__dirname, '../..');

export function* walkImageFiles(dir: string, baseDir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkImageFiles(fullPath, baseDir);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        const relative = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        yield relative;
      }
    }
  }
}

type SharpModule = {
  (input: string): { png: () => { toFile: (path: string) => Promise<void> } };
};

export function loadSharp(): SharpModule | null {
  try {
    return require('sharp') as SharpModule;
  } catch {
    const pnpmRoot = path.join(REPO_ROOT, 'frontend', 'node_modules', '.pnpm');
    if (!fs.existsSync(pnpmRoot)) return null;

    for (const entry of fs.readdirSync(pnpmRoot)) {
      if (!entry.startsWith('sharp@')) continue;
      const candidate = path.join(pnpmRoot, entry, 'node_modules', 'sharp');
      if (!fs.existsSync(candidate)) continue;
      try {
        return require(candidate) as SharpModule;
      } catch {
        continue;
      }
    }
    return null;
  }
}

export async function writeVocabPng(
  sourcePath: string,
  destPath: string,
): Promise<void> {
  const ext = path.extname(sourcePath).toLowerCase();
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  if (ext === '.png') {
    fs.copyFileSync(sourcePath, destPath);
    return;
  }

  const sharp = loadSharp();
  if (!sharp) {
    throw new Error(
      `Cannot convert ${ext} to png (sharp not found). Install sharp or use png sources only.`,
    );
  }

  await sharp(sourcePath).png().toFile(destPath);
}
