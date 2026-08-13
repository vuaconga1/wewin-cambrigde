"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KidsGamesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/games/kids/my-future-career-fair");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm font-medium text-slate-600">Đang mở Kids Games…</p>
    </div>
  );
}
