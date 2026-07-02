"use client";

import { useEffect, useRef } from "react";
import { useStudentStore } from "@/stores/student.store";
import { studentService } from "@/services/student.service";

/**
 * Tự động đăng nhập học sinh khi được nhúng (iframe) từ web báo bài.
 *
 * Web báo bài mở khu trò chơi kèm query param `?sid=<Mã HV>&name=<Tên>`.
 * Component này đọc param đó, gọi API tìm-hoặc-tạo học sinh trong DB games,
 * lưu session rồi dọn param khỏi URL để tránh xử lý lặp lại.
 */
export default function StudentSsoHydrator() {
  const setSession = useStudentStore((s) => s.setSession);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const sid = (params.get("sid") || "").trim();
    const name = (params.get("name") || "").trim();

    if (!sid) return;
    handledRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const student = await studentService.ensurePlayerId(sid, name);
        if (!cancelled) setSession(student);
      } catch (err) {
        console.error("[StudentSsoHydrator] Không thể đăng nhập tự động:", err);
      } finally {
        // Dọn param khỏi URL (giữ nguyên path + các param khác) để tránh lộ Mã HV
        // và tránh chạy lại khi điều hướng.
        const url = new URL(window.location.href);
        url.searchParams.delete("sid");
        url.searchParams.delete("name");
        window.history.replaceState(
          {},
          "",
          url.pathname + url.search + url.hash,
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setSession]);

  return null;
}
