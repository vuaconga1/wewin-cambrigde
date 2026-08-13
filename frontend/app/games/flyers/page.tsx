"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FlyersGamesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/games/flyers/unit-0-hello");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm font-medium text-slate-600">Đang mở Flyers Games…</p>
    </div>
  );
}
