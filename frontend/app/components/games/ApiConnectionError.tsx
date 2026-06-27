"use client";

type Props = {
  title?: string;
  message?: string;
};

export function ApiConnectionError({
  title = "Không kết nối được máy chủ",
  message = "Backend API chưa chạy hoặc sai cổng. Mở terminal tại thư mục backend và chạy: npm run start:dev (mặc định cổng 3001). Sau đó tải lại trang.",
}: Props) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-red-800 mb-2">{title}</h2>
        <p className="text-sm text-red-700 leading-relaxed">{message}</p>
        <p className="mt-3 text-xs text-red-600/80">
          API: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
        </p>
      </div>
    </div>
  );
}
