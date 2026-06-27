"use client";

import { useState, useEffect } from "react";
import { studentService } from "@/services/student.service";
import { useStudentStore } from "@/stores/student.store";

type PlayerIdModalProps = {
  isOpen: boolean;
  onSubmit: (playerId: string) => void;
  onSkip: () => void;
};

export function PlayerIdModal({ isOpen, onSubmit, onSkip }: PlayerIdModalProps) {
  const [playerId, setPlayerId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setSession = useStudentStore((s) => s.setSession);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      setPlayerId("");
      setError("");
    }
  }, [isOpen, mounted]);

  const handleSubmit = async () => {
    const trimmed = playerId.trim();
    if (!trimmed) {
      setError("Vui lòng nhập ID của bạn");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const student = await studentService.verifyPlayerId(trimmed);
      setSession(student);
      onSubmit(student.playerId);
    } catch {
      setError("ID không hợp lệ. Vui lòng kiểm tra lại hoặc liên hệ giáo viên.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      void handleSubmit();
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full text-center shadow-2xl">
        <h2 className="text-blue-500 mb-4 sm:mb-5 text-2xl sm:text-3xl font-bold">
          🎮 Nhập ID Người Chơi
        </h2>
        <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
          Vui lòng nhập ID học sinh của bạn để lưu điểm và tiến độ
        </p>
        <div className="mb-5 sm:mb-6">
          <input
            type="text"
            value={playerId}
            onChange={(e) => {
              setPlayerId(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyPress}
            placeholder="Nhập ID của bạn..."
            maxLength={50}
            disabled={loading}
            className="text-black w-full p-3 sm:p-4 border-2 border-gray-300 rounded-2xl text-base sm:text-lg text-center focus:outline-none focus:border-blue-500 disabled:opacity-60"
            autoFocus
          />
          {error && (
            <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="bg-[#1057C1] text-white px-6 sm:px-8 py-3 rounded-2xl text-base sm:text-lg font-bold hover:bg-[#0c3e8c] transition w-full sm:w-auto disabled:opacity-60"
          >
            {loading ? "Đang xác nhận..." : "Xác nhận"}
          </button>
          <button
            onClick={onSkip}
            disabled={loading}
            className="bg-gray-200 text-gray-600 px-6 sm:px-8 py-3 rounded-2xl text-base sm:text-lg font-bold hover:bg-gray-300 transition w-full sm:w-auto disabled:opacity-60"
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}
