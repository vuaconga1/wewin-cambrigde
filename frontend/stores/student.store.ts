import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StudentSession = {
  id: string;
  playerId: string;
  name: string;
};

const BOOK_PLAYER_STORAGE_KEYS = [
  "kids_book_player_id",
  "starter_book_player_id",
  "mover_book_player_id",
  "flyer_book_player_id",
] as const;

function clearBookPlayerLocalStorage() {
  if (typeof window === "undefined") return;
  BOOK_PLAYER_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

interface StudentState {
  session: StudentSession | null;
  setSession: (session: StudentSession) => void;
  clearSession: () => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => {
        clearBookPlayerLocalStorage();
        set({ session: null });
      },
    }),
    {
      name: "student-storage",
      partialize: (state) => ({ session: state.session }),
    },
  ),
);
