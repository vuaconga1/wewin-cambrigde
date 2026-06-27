"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, ImageIcon, LayoutGrid, ShieldUser, Swords } from "lucide-react";
import { Routes } from "@/lib/constants/routes";

const navigation = [
  {
    href: Routes.HOME,
    label: "Tổng quan",
    icon: LayoutGrid,
  },
  {
    href: Routes.MANAGE_USER,
    label: "Quản lý user",
    icon: ShieldUser,
  },
  {
    href: Routes.MANAGE_GAME_UNITS,
    label: "Quản lý game units",
    icon: Swords,
  },
  {
    href: Routes.MANAGE_VOCABULARY,
    label: "Quản lý vocabulary",
    icon: BookOpenText,
  },
  {
    href: Routes.MANAGE_VOCAB_IMAGES,
    label: "Duyệt ảnh từ vựng",
    icon: ImageIcon,
  },
];

export function ManagementSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[290px] shrink-0 border-r border-slate-200 bg-[#071326] px-4 py-5 text-white shadow-[16px_0_40px_rgba(7,19,38,0.18)] md:flex md:flex-col">
      <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.34em] text-blue-200">Wewin</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Management</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Quản trị nội dung và người dùng của hệ thống.
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {navigation.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-white text-slate-950 shadow-lg"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  active ? "bg-slate-100 text-[#0E4BA9]" : "bg-white/10 text-blue-200"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[24px] border border-white/10 bg-gradient-to-br from-[#0E4BA9] to-[#00A6FB] p-4 text-white shadow-xl">
        <p className="text-sm font-semibold">Mẹo nhanh</p>
        <p className="mt-2 text-sm leading-6 text-blue-50">
          Dùng sidebar này để chuyển giữa user và game units, tránh phải quay lại dashboard.
        </p>
      </div>
    </aside>
  );
}