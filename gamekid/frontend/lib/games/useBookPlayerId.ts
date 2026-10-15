"use client";

import { useState, useEffect, useCallback } from "react";
import { useStudentStore } from "@/stores/student.store";

function readBookPlayerId(storageKey: string): string {
  if (typeof window === "undefined") return "";
  const saved = localStorage.getItem(storageKey) || "";
  return saved === "anonymous" ? "" : saved;
}

type UseBookPlayerIdOptions = {
  storageKey: string;
  reloadFlagKey: string;
  onReloadClear?: () => void;
};

/**
 * Quản lý ID người chơi cho màn game: ưu tiên session học sinh toàn cục,
 * đồng bộ với localStorage theo từng loại sách.
 */
export function useBookPlayerId({
  storageKey,
  reloadFlagKey,
  onReloadClear,
}: UseBookPlayerIdOptions) {
  const studentSession = useStudentStore((s) => s.session);
  void reloadFlagKey;
  void onReloadClear;

  const [playerId, setPlayerId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const globalId = useStudentStore.getState().session?.playerId;
    return globalId || readBookPlayerId(storageKey) || "";
  });

  const [showIdModal, setShowIdModal] = useState(() => {
    if (typeof window === "undefined") return false;
    const globalId = useStudentStore.getState().session?.playerId;
    return !globalId && !readBookPlayerId(storageKey);
  });

  useEffect(() => {
    if (studentSession?.playerId) {
      setPlayerId(studentSession.playerId);
      localStorage.setItem(storageKey, studentSession.playerId);
      setShowIdModal(false);
      return;
    }
    const saved = readBookPlayerId(storageKey);
    if (saved) {
      setPlayerId(saved);
      setShowIdModal(false);
    } else {
      setPlayerId("");
      setShowIdModal(true);
    }
  }, [studentSession, storageKey]);

  const handlePlayerIdSubmit = useCallback(
    (id: string) => {
      setPlayerId(id);
      localStorage.setItem(storageKey, id);
      setShowIdModal(false);
    },
    [storageKey],
  );

  const handlePlayerIdSkip = useCallback(() => {
    setPlayerId("anonymous");
    localStorage.setItem(storageKey, "anonymous");
    setShowIdModal(false);
  }, [storageKey]);

  return {
    playerId,
    showIdModal,
    handlePlayerIdSubmit,
    handlePlayerIdSkip,
    setShowIdModal,
  };
}
