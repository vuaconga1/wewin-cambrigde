import { silenceHtmlMediaForMic } from "@/app/utils/playWordAudio";

export type RecordedClip = {
  blob: Blob;
  mimeType: string;
};

const MIC_AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/mp4",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function openMicStream(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Trình duyệt không hỗ trợ ghi âm");
  }
  silenceHtmlMediaForMic();
  const stream = await navigator.mediaDevices.getUserMedia(MIC_AUDIO_CONSTRAINTS);
  // iOS resumes the last HTMLAudio during getUserMedia — kill it again.
  silenceHtmlMediaForMic();
  return stream;
}

/**
 * Start mic capture. Await `done` for the clip (ends on `stop()` or maxMs).
 * iOS Safari typically records `audio/mp4`.
 */
export async function startMicRecording(maxMs = 8000): Promise<{
  stop: () => void;
  cancel: () => void;
  done: Promise<RecordedClip>;
}> {
  const stream = await openMicStream();
  const mimeType = pickMimeType();
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  let settle: ((clip: RecordedClip) => void) | null = null;
  let fail: ((err: Error) => void) | null = null;
  let closed = false;

  const cleanup = () => {
    stream.getTracks().forEach((track) => track.stop());
  };

  const done = new Promise<RecordedClip>((resolve, reject) => {
    settle = resolve;
    fail = reject;
  });

  recorder.onerror = () => {
    if (closed) return;
    closed = true;
    clearTimeout(maxTimer);
    cleanup();
    fail?.(new Error("Không ghi được âm thanh"));
  };

  recorder.onstop = () => {
    if (closed) return;
    closed = true;
    clearTimeout(maxTimer);
    cleanup();
    const type = recorder.mimeType || mimeType || "audio/webm";
    const blob = new Blob(chunks, { type });
    if (!blob.size) {
      fail?.(new Error("Không thu được âm thanh. Thử nói to hơn nhé."));
      return;
    }
    settle?.({ blob, mimeType: type });
  };

  // timeslice: iOS Safari often yields an empty blob if data only arrives on stop.
  recorder.start(250);

  const maxTimer = setTimeout(() => {
    if (!closed && recorder.state === "recording") {
      recorder.stop();
    }
  }, maxMs);

  return {
    stop: () => {
      if (!closed && recorder.state === "recording") {
        recorder.stop();
      }
    },
    cancel: () => {
      clearTimeout(maxTimer);
      if (closed) return;
      closed = true;
      cleanup();
      if (recorder.state === "recording" || recorder.state === "paused") {
        try {
          recorder.stop();
        } catch {
          // ignore
        }
      }
      fail?.(new Error("Đã hủy ghi âm"));
    },
    done,
  };
}

export async function transcribeRecordedClip(clip: RecordedClip): Promise<string> {
  const ext = clip.mimeType.includes("mp4")
    ? "mp4"
    : clip.mimeType.includes("ogg")
      ? "ogg"
      : "webm";
  const form = new FormData();
  form.append("audio", clip.blob, `recording.${ext}`);

  const res = await fetch("/api/games/pronunciation/assess", {
    method: "POST",
    body: form,
  });
  const json = (await res.json()) as {
    success?: boolean;
    transcript?: string;
    message?: string;
  };

  if (!res.ok || !json.success || !json.transcript?.trim()) {
    throw new Error(
      json.message || "Chưa nhận dạng được giọng nói. Hãy thử lại.",
    );
  }

  return json.transcript.trim();
}
