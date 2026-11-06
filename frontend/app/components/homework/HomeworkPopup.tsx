"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { BookOpenCheck, X } from "lucide-react";
import { useStudentStore } from "@/stores/student.store";
import {
  homeworkService,
  type HomeworkItem,
} from "@/services/homework.service";
import { BOOK_TYPE_TO_ROUTE } from "@/lib/games/bookRoutes";

const GAME_LABELS: Record<string, string> = {
  flip: "Flip Card",
  speak: "Pronunciation",
  memory: "Memory",
  ordering: "Word Ordering",
  scramble: "Word Scramble",
};

function vnDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
}

const dismissKey = (playerId: string) =>
  `homework-dismissed:${playerId.toLowerCase()}:${vnDateKey()}`;

/** Chỉ hiện ở trang chủ / trang sách, không chen vào lúc đang chơi game. */
function isPopupPage(pathname: string) {
  if (pathname === "/") return true;
  const parts = pathname.split("/").filter(Boolean);
  return parts[0] === "games" && parts.length <= 2;
}

function playHref(item: HomeworkItem) {
  const route = BOOK_TYPE_TO_ROUTE[item.bookType] ?? item.bookType;
  const base = `/games/${route}/${item.unitSlug}/${item.partId}`;
  return item.gameTypes.length === 1 ? `${base}/${item.gameTypes[0]}` : base;
}

export default function HomeworkPopup() {
  const pathname = usePathname() ?? "/";
  const { data: session, status } = useSession();
  const studentSession = useStudentStore((s) => s.session);
  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissPlayerId, setDismissPlayerId] = useState<string | null>(null);

  const isStaffSession =
    status === "authenticated" &&
    !session?.user.roles?.some((r) => r.name?.toUpperCase() === "STUDENT");
  const playerId =
    status === "authenticated"
      ? session?.user.username ?? null
      : studentSession?.playerId ?? null;
  const shouldCheck =
    status !== "loading" && !isStaffSession && !!playerId && isPopupPage(pathname);

  useEffect(() => {
    if (!shouldCheck || !playerId) return;
    if (localStorage.getItem(dismissKey(playerId))) return;

    let cancelled = false;
    const request =
      status === "authenticated"
        ? homeworkService.incompleteForMe()
        : homeworkService.incompleteByPlayer(playerId);
    request
      .then((res) => {
        if (cancelled || res.items.length === 0) return;
        setItems(res.items);
        setDismissPlayerId(playerId);
        setOpen(true);
      })
      .catch((err) => console.warn("[HomeworkPopup]", err));
    return () => {
      cancelled = true;
    };
  }, [shouldCheck, playerId, status]);

  if (!open || items.length === 0) return null;

  const close = () => setOpen(false);
  const dismissToday = () => {
    if (dismissPlayerId) localStorage.setItem(dismissKey(dismissPlayerId), "1");
    setOpen(false);
  };

  const overdue = items.filter((i) => i.isOverdue);
  const upcoming = items.filter((i) => !i.isOverdue);

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={close}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Đóng"
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 px-6 pb-3 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
            <BookOpenCheck className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
              Bạn có {items.length} bài tập chưa hoàn thành
            </h3>
            {overdue.length > 0 && (
              <p className="text-sm text-red-600">{overdue.length} bài đã quá hạn</p>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-2">
          {overdue.length > 0 && (
            <HomeworkGroup title="Quá hạn" items={overdue} onGo={close} />
          )}
          {upcoming.length > 0 && (
            <HomeworkGroup title="Sắp đến hạn" items={upcoming} onGo={close} />
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={dismissToday}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Không hiện lại hôm nay
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function HomeworkGroup({
  title,
  items,
  onGo,
}: {
  title: string;
  items: HomeworkItem[];
  onGo: () => void;
}) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.assignmentId}
            className={`rounded-2xl border p-3 ${
              item.isOverdue ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  {item.title}
                  {item.isNew && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                      Mới
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  Lớp {item.className} · Hạn {item.deadlineDisplay} · Đã làm{" "}
                  {item.doneCount}/{item.totalCount}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {item.gameTypes.map((g) => GAME_LABELS[g] ?? g).join(", ")}
                </p>
              </div>
              <Link
                href={playHref(item)}
                onClick={onGo}
                className="shrink-0 rounded-xl bg-pink-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                Làm bài
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
