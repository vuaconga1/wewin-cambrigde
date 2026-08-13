"use client";

import { useEffect, useState } from "react";

type Props = {
  title?: string;
  message?: string;
  /** Tự tải lại trang sau N giây (0 = tắt). Mặc định 12s. */
  autoRetrySeconds?: number;
};

function isRemoteApi() {
  const url = process.env.NEXT_PUBLIC_API_URL || "";
  return /onrender\.com|vercel\.app|railway\.app|fly\.dev/i.test(url);
}

export function ApiConnectionError({
  title,
  message,
  autoRetrySeconds = 12,
}: Props) {
  const remote = isRemoteApi();
  const resolvedTitle =
    title ??
    "Không kết nối được máy chủ";
  const resolvedMessage =
    message ??
    (remote
      ? "Không gọi được backend (CORS, URL API, hoặc máy chủ lỗi). Railway không sleep như Render — nếu trang kẹt mãi, kiểm tra CORS_ORIGINS và NEXT_PUBLIC_API_URL. Bấm Thử lại hoặc đợi trang tự tải lại."
      : "Backend API chưa chạy hoặc sai cổng. Mở terminal tại thư mục backend và chạy: pnpm start:dev (mặc định cổng 3001). Sau đó tải lại trang.");

  const [secondsLeft, setSecondsLeft] = useState(autoRetrySeconds);

  useEffect(() => {
    if (autoRetrySeconds <= 0) return;

    setSecondsLeft(autoRetrySeconds);
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [autoRetrySeconds]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-amber-900 mb-2">{resolvedTitle}</h2>
        <p className="text-sm text-amber-800 leading-relaxed">{resolvedMessage}</p>
        <p className="mt-3 text-xs text-amber-700/80">
          API: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
        </p>

        <div className="mt-5 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[#0E4BA9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c3f8f]"
          >
            Thử lại ngay
          </button>
          {autoRetrySeconds > 0 && (
            <p className="text-xs text-amber-700">
              Tự thử lại sau {secondsLeft}s…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
