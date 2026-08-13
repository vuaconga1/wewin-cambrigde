"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StartersGamesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/games/starters/hello-unit");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm font-medium text-slate-600">Đang mở Starters Games…</p>
    </div>
  );
}
