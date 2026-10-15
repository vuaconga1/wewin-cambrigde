"use client";

type Props = {
  label?: string;
};

export function ApiWakingLoader({
  label = "Đang tải…",
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0E4BA9]/25 border-t-[#0E4BA9]" />
        <p className="text-base font-semibold text-slate-800">{label}</p>
      </div>
    </div>
  );
}
