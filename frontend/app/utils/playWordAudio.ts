import type { WordAudioContext, WordItem } from "@/types/games";

type PlayHooks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

let activeAudio: HTMLAudioElement | null = null;

function normalizeMediaUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

function buildCandidateUrls(
  word: Pick<WordItem, "id" | "audio" | "audioUrl">,
  context?: WordAudioContext,
): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const add = (url?: string | null) => {
    if (!url) return;
    const normalized = normalizeMediaUrl(url);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    urls.push(normalized);
  };

  add(word.audioUrl ?? undefined);
  add(word.audio ?? undefined);

  if (context?.bookType && context?.gameSlug) {
    const base = `/audio/wewin/${context.bookType}/${context.gameSlug}/${word.id.toLowerCase()}`;
    add(`${base}.mp3`);
  }

  return urls;
}

export function stopWordAudio(): void {
  if (!activeAudio) return;
  const audio = activeAudio;
  activeAudio = null;
  audio.onplay = null;
  audio.onended = null;
  audio.onerror = null;
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch {
    // ignore
  }
  audio.removeAttribute("src");
  audio.load();
}

export function playWordAudio(
  word: Pick<WordItem, "id" | "text" | "audio" | "audioUrl">,
  context?: WordAudioContext,
  hooks?: PlayHooks,
): void {
  if (typeof window === "undefined") return;

  const urls = buildCandidateUrls(word, context);
  if (!urls.length) {
    hooks?.onError?.();
    hooks?.onEnd?.();
    return;
  }

  stopWordAudio();

  const tryAt = (index: number) => {
    if (index >= urls.length) {
      hooks?.onError?.();
      hooks?.onEnd?.();
      return;
    }

    const audio = new Audio(urls[index]);
    activeAudio = audio;

    audio.onplay = () => {
      hooks?.onStart?.();
    };

    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
      hooks?.onEnd?.();
    };

    audio.onerror = () => {
      if (activeAudio === audio) activeAudio = null;
      tryAt(index + 1);
    };

    void audio.play().catch(() => {
      if (activeAudio === audio) activeAudio = null;
      tryAt(index + 1);
    });
  };

  tryAt(0);
}

export function bookTypeFromPathname(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  const rootIndex = segments.findIndex((s) => s === "games" || s === "resources");
  if (rootIndex < 0 || rootIndex + 1 >= segments.length) return undefined;

  const raw = segments[rootIndex + 1];
  if (raw === "starters") return "starter";
  if (raw === "movers") return "mover";
  if (raw === "flyers") return "flyer";
  if (raw === "kids" || raw === "starter" || raw === "mover" || raw === "flyer") {
    return raw;
  }
  return undefined;
}