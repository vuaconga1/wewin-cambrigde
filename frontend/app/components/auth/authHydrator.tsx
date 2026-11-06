"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth.store";
import { useStudentStore } from "@/stores/student.store";
import { studentService } from "@/services/student.service";
import type { AuthUser } from "@/types/auth-user";

export default function AuthHydrator() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setStudentSession = useStudentStore((s) => s.setSession);
  const clearStudentSession = useStudentStore((s) => s.clearSession);
  const verifiedUsernameRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user as unknown as AuthUser);

      // Tài khoản học viên (username = Mã HV) dùng luôn Mã HV cho game/bảng xếp hạng.
      const username = session.user.username?.trim();
      const isStudent = session.user.roles?.some(
        (r) => r.name?.toUpperCase() === "STUDENT",
      );
      if (!username || !isStudent) {
        clearStudentSession();
        return;
      }

      const current = useStudentStore.getState().session;
      if (current?.playerId.toLowerCase() === username.toLowerCase()) return;
      if (verifiedUsernameRef.current === username) return;
      verifiedUsernameRef.current = username;

      studentService
        .verifyPlayerId(username)
        .then(setStudentSession)
        .catch((err) => {
          verifiedUsernameRef.current = null;
          console.warn("[AuthHydrator] Không gắn được Mã HV:", err);
        });
    }

    if (status === "unauthenticated") {
      verifiedUsernameRef.current = null;
      clearUser();
    }
  }, [status, session, setUser, clearUser, setStudentSession, clearStudentSession]);

  return null;
}
