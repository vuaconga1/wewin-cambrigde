"use client";

import Navbar from "./layouts/header";
import Sidebar from "./layouts/sidebar";
import Footer from "./layouts/footer";
import ClickSound from "./layouts/clickSound";
import { useAuthStore } from "@/stores/auth.store";
import { PERMISSIONS } from "@/lib/constants/permission";

export default function ProvidersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Lấy trực tiếp từ Zustand
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const user = useAuthStore((s) => s.user);

  const canViewSidebar =
    !!user && hasPermission(PERMISSIONS.SIDEBAR_MANAGEMENT);

  return (
    <>
      <ClickSound />

      {/* 🧭 Navbar */}
      <Navbar />

      {/* 🧩 Main Area */}
      <div className="flex min-h-[calc(100vh-80px)] flex-1 w-full flex-col md:flex-row overflow-hidden">
        {canViewSidebar && (
          <aside className="hidden md:flex text-white shadow-lg flex-col justify-between">
            <Sidebar />
          </aside>
        )}

        <main className="min-w-0 flex-1 bg-[#f9f9f9] overflow-x-hidden max-w-full">
          {children}
        </main>
      </div>

      {/* ⚓ Footer */}
      <Footer />
    </>
  );
}
