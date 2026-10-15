import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import {
  approvedImagePublicPath,
  pendingImagePublicPath,
  rejectedImagePublicPath,
} from '../util/vocab-word.util';

export type VocabImageFolder = 'pending' | 'approved' | 'rejected' | 'temp';

@Injectable()
export class VocabImagesStorageService {
  private readonly assetsRoot: string;

  constructor() {
    const repoRoot = path.resolve(__dirname, '../../..');
    this.assetsRoot = path.join(repoRoot, 'frontend', 'public', 'assets', 'vocab');
    this.ensureFolders();
  }

  private ensureFolders(): void {
    for (const folder of ['pending', 'approved', 'rejected', 'temp'] as const) {
      const dir = this.folderPath(folder);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  folderPath(folder: VocabImageFolder): string {
    return path.join(this.assetsRoot, folder);
  }

  filePath(folder: VocabImageFolder, slug: string): string {
    return path.join(this.folderPath(folder), `${slug}.png`);
  }

  exists(folder: VocabImageFolder, slug: string): boolean {
    return fs.existsSync(this.filePath(folder, slug));
  }

  savePending(slug: string, buffer: Buffer): string {
    const target = this.filePath('pending', slug);
    fs.writeFileSync(target, buffer);
    return pendingImagePublicPath(slug);
  }

  movePendingToApproved(slug: string): string {
    return this.moveFile('pending', 'approved', slug, approvedImagePublicPath(slug));
  }

  movePendingToRejected(slug: string): string {
    return this.moveFile('pending', 'rejected', slug, rejectedImagePublicPath(slug));
  }

  archivePendingToRejected(slug: string): void {
    const pending = this.filePath('pending', slug);
    if (!fs.existsSync(pending)) return;

    const rejected = this.filePath('rejected', slug);
    if (fs.existsSync(rejected)) {
      fs.unlinkSync(rejected);
    }
    fs.renameSync(pending, rejected);
  }

  private moveFile(
    from: VocabImageFolder,
    to: VocabImageFolder,
    slug: string,
    publicUrl: string,
  ): string {
    const source = this.filePath(from, slug);
    const destination = this.filePath(to, slug);

    if (!fs.existsSync(source)) {
      throw new Error(`Missing ${from} image for slug "${slug}"`);
    }

    if (fs.existsSync(destination)) {
      fs.unlinkSync(destination);
    }

    fs.renameSync(source, destination);
    return publicUrl;
  }
}
