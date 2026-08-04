import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Transcribe short pronunciation clips via OpenAI Whisper.
 * Requires OPENAI_API_KEY in Vercel / .env.local
 */
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "missing-openai-key",
        message:
          "Chưa cấu hình OPENAI_API_KEY. Thêm key vào Vercel Environment Variables rồi redeploy.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "invalid-form", message: "Không đọc được file ghi âm." },
      { status: 400 },
    );
  }

  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size < 50) {
    return NextResponse.json(
      { error: "empty-audio", message: "File ghi âm trống hoặc quá ngắn." },
      { status: 400 },
    );
  }

  const expectedWord =
    typeof form.get("expectedWord") === "string"
      ? String(form.get("expectedWord")).trim()
      : "";

  const filename =
    audio instanceof File && audio.name
      ? audio.name
      : `speech.${guessExtension(audio.type)}`;

  const upstream = new FormData();
  upstream.append("file", audio, filename);
  upstream.append("model", "whisper-1");
  upstream.append("language", "en");
  upstream.append("response_format", "json");
  // Bias Whisper toward the target vocabulary word.
  if (expectedWord) {
    upstream.append(
      "prompt",
      `The student is pronouncing the English word: ${expectedWord}.`,
    );
  }

  try {
    const whisperRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: upstream,
      },
    );

    const payload = (await whisperRes.json().catch(() => ({}))) as {
      text?: string;
      error?: { message?: string };
    };

    if (!whisperRes.ok) {
      return NextResponse.json(
        {
          error: "whisper-failed",
          message:
            payload.error?.message ||
            "Không nhận diện được giọng nói. Thử ghi lại rõ hơn nhé!",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      transcript: (payload.text || "").trim(),
    });
  } catch {
    return NextResponse.json(
      {
        error: "whisper-network",
        message: "Lỗi mạng khi gửi giọng nói. Kiểm tra kết nối rồi thử lại.",
      },
      { status: 502 },
    );
  }
}

function guessExtension(mimeType: string): string {
  if (!mimeType) return "m4a";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  return "m4a";
}
