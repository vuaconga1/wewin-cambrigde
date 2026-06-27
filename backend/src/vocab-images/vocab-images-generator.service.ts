import { Injectable, Logger } from '@nestjs/common';

export const VOCAB_GENERATION_PROMPT = (word: string) =>
  `Create one educational vocabulary illustration for the English word: "${word}".

Rules:
- Plain white or very light solid background.
- No text, no letters, no labels, no watermark.
- One single object or simple scene only.
- Cute clean cartoon style.
- Same style for all vocabulary images.
- Centered subject.
- Suitable for a children's vocabulary learning game.
- The meaning must be obvious by looking at the image.

For comparative words like shorter, shortest, taller, tallest, bigger, biggest:
- Use simple comparison between 2 or 3 characters/objects.
- Do not write any word on the image.`;

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
};

type GeminiGenerateResponse = {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { message?: string; status?: string };
};

@Injectable()
export class VocabImagesGeneratorService {
  private readonly logger = new Logger(VocabImagesGeneratorService.name);
  private readonly maxRetries = 3;

  async generatePng(word: string): Promise<Buffer> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Generating image for "${word}" via Gemini (attempt ${attempt}/${this.maxRetries})`);
        return await this.requestGeminiImage(apiKey, word);
      } catch (error) {
        lastError = error;
        this.logger.warn(`Generate failed for "${word}" attempt ${attempt}: ${String(error)}`);
        if (this.isNonRetryableError(error) || attempt >= this.maxRetries) break;
        await this.delay(500 * attempt);
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private isNonRetryableError(error: unknown): boolean {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    return (
      message.includes('billing') ||
      message.includes('quota') ||
      message.includes('resource_exhausted') ||
      message.includes('permission') ||
      message.includes('api key') ||
      message.includes('invalid') ||
      message.includes('not configured')
    );
  }

  private async requestGeminiImage(apiKey: string, word: string): Promise<Buffer> {
    const model = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: VOCAB_GENERATION_PROMPT(word) }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    const payload = (await response.json()) as GeminiGenerateResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message ?? `Gemini HTTP ${response.status}`);
    }

    const parts = payload.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const data = part.inlineData?.data;
      if (data) {
        return Buffer.from(data, 'base64');
      }
    }

    throw new Error('Gemini returned no image data.');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}