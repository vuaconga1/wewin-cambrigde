import { NextResponse } from "next/server";

import { transcribeWithGroq } from "@/lib/games/groqTranscribe";

const MAX_AUDIO_BYTES = 2_500_000;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");

    if (!(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json(
        { success: false, message: "Thiếu file ghi âm" },
        { status: 400 },
      );
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { success: false, message: "File ghi âm quá lớn. Hãy ghi ngắn hơn." },
        { status: 413 },
      );
    }

    const mime = audio.type || "audio/webm";
    const ext = mime.includes("mp4")
      ? "mp4"
      : mime.includes("ogg")
        ? "ogg"
        : "webm";

    const result = await transcribeWithGroq(audio, `recording.${ext}`);
    if (!result.ok) {
      const message =
        result.reason === "missing_key"
          ? "Chưa cấu hình GROQ_API_KEY trên server."
          : result.reason === "rate_limit"
            ? "Hệ thống đang bận. Bạn thử lại sau vài giây nhé!"
            : "Chưa nhận dạng được giọng nói. Hãy thử đọc to hơn.";
      const status =
        result.reason === "missing_key"
          ? 503
          : result.reason === "rate_limit"
            ? 429
            : 502;
      return NextResponse.json({ success: false, message }, { status });
    }

    return NextResponse.json({
      success: true,
      transcript: result.transcript,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Lỗi nhận dạng giọng nói" },
      { status: 500 },
    );
  }
}
