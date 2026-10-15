"use client";

import { usePathname } from "next/navigation";
import Navbar from "./layouts/header";
import Sidebar from "./layouts/sidebar";
import Footer from "./layouts/footer";
import ClickSound from "./layouts/clickSound";
import {
  BackgroundMusicProvider,
  GlobalAudioControls,
} from "@/app/components/audio";
import { useAuthStore } from "@/stores/auth.store";
import { PERMISSIONS } from "@/lib/constants/permission";
import { isFullscreenGameRoute } from "@/lib/constants/routes";

function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGamePage = isFullscreenGameRoute(pathname);

  const hasPermission = useAuthStore((s) => s.hasPermission);
  const user = useAuthStore((s) => s.user);

  const canViewSidebar =
    !!user && hasPermission(PERMISSIONS.SIDEBAR_MANAGEMENT);

  if (isGamePage) {
    return (
      <main className="min-w-0 flex-1 overflow-x-hidden max-w-full">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <div className="flex min-h-[calc(100vh-80px)] flex-1 w-full flex-col md:flex-row overflow-hidden pt-20">
        {canViewSidebar && (
          <aside className="hidden md:flex text-white shadow-lg flex-col justify-between">
            <Sidebar />
          </aside>
        )}

        <main className="min-w-0 flex-1 bg-[#f9f9f9] overflow-x-hidden max-w-full">
          {children}
        </main>
      </div>

      <Footer />
    </>
  );
}

export default function ProvidersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BackgroundMusicProvider>
      <ClickSound />
      <GlobalAudioControls />
      <AppChrome>{children}</AppChrome>
    </BackgroundMusicProvider>
  );
}
