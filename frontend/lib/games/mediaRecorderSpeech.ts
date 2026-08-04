/**
 * MediaRecorder-based capture for iOS Safari.
 * Web Speech API (webkitSpeechRecognition) is unreliable on iPhone (aborted loop).
 */

export type MediaRecordingSession = {
  stream: MediaStream;
  recorder: MediaRecorder;
  mimeType: string;
  chunks: BlobPart[];
};

export function isMediaRecorderSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

export function pickRecorderMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/mp4";

  const candidates = [
    "audio/mp4",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }

  return "";
}

export function extensionForMime(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("aac") || mimeType.includes("m4a")) {
    return "m4a";
  }
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("webm")) return "webm";
  return "m4a";
}

export async function startMediaRecording(): Promise<MediaRecordingSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
    },
  });

  const mimeType = pickRecorderMimeType();
  const chunks: BlobPart[] = [];
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  // timeslice giúp Safari flush chunks sớm hơn
  recorder.start(250);

  return {
    stream,
    recorder,
    mimeType: recorder.mimeType || mimeType || "audio/mp4",
    chunks,
  };
}

export function stopMediaRecording(
  session: MediaRecordingSession,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { recorder, stream, chunks, mimeType } = session;

    const finish = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: mimeType || "audio/mp4" });
      if (blob.size < 100) {
        reject(new Error("empty-recording"));
        return;
      }
      resolve(blob);
    };

    if (recorder.state === "inactive") {
      finish();
      return;
    }

    recorder.onerror = () => {
      stream.getTracks().forEach((track) => track.stop());
      reject(new Error("recorder-error"));
    };

    recorder.onstop = () => finish();

    try {
      if (recorder.state === "recording") {
        recorder.requestData?.();
      }
      recorder.stop();
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());
      reject(error);
    }
  });
}

export function cancelMediaRecording(session: MediaRecordingSession | null) {
  if (!session) return;
  try {
    if (session.recorder.state !== "inactive") {
      session.recorder.onstop = null;
      session.recorder.stop();
    }
  } catch {
    // ignore
  }
  session.stream.getTracks().forEach((track) => track.stop());
}

export async function transcribeAudioBlob(
  blob: Blob,
  expectedWord?: string,
): Promise<{ transcript: string }> {
  const mimeType = blob.type || "audio/mp4";
  const ext = extensionForMime(mimeType);
  const form = new FormData();
  form.append("audio", blob, `speech.${ext}`);
  if (expectedWord) {
    form.append("expectedWord", expectedWord);
  }

  const response = await fetch("/api/speech/transcribe", {
    method: "POST",
    body: form,
  });

  const data = (await response.json().catch(() => ({}))) as {
    transcript?: string;
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    const err = new Error(data.error || "transcribe-failed") as Error & {
      status?: number;
      messageVi?: string;
    };
    err.status = response.status;
    err.messageVi = data.message;
    throw err;
  }

  return { transcript: (data.transcript || "").trim() };
}
