"use client";

import { useEffect, useState } from "react";

type Props = {
  label?: string;
};

export function ApiWakingLoader({
  label = "Đang kết nối máy chủ…",
}: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const showColdStartHint = elapsed >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0E4BA9]/25 border-t-[#0E4BA9]" />
        <p className="text-base font-semibold text-slate-800">{label}</p>
        {showColdStartHint ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Máy chủ vừa ngủ đang khởi động lại — lần đầu có thể mất khoảng 1 phút.
            Vui lòng giữ trang này.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">{elapsed}s</p>
        )}
      </div>
    </div>
  );
}
