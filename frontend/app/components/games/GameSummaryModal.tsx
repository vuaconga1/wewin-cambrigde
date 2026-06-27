"use client";

type GameSummaryModalProps = {
  open: boolean;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalCount: number;
  onPlayAgain: () => void;
  onChooseOtherGame?: () => void;
};

export function GameSummaryModal({
  open,
  score,
  correctCount,
  wrongCount,
  totalCount,
  onPlayAgain,
  onChooseOtherGame,
}: GameSummaryModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
      <section className="relative w-full max-w-2xl overflow-hidden rounded-[36px] border border-blue-100 bg-[#FDFBF7] p-6 text-center shadow-2xl sm:rounded-[48px] sm:p-10">
        <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-blue-300 opacity-50 blur-2xl mix-blend-multiply animate-pulse" />
        <div
          className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-cyan-300 opacity-50 blur-2xl mix-blend-multiply animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        <h2 className="mb-4 text-3xl font-black uppercase text-transparent drop-shadow-sm bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 sm:text-4xl md:text-5xl">
          Chúc mừng bé!
        </h2>
        <p className="mb-8 text-lg font-bold text-slate-600 sm:text-xl">
          Bé đã hoàn thành xuất sắc trò chơi 🏆
        </p>

        <div className="mx-auto mb-8 max-w-sm rounded-3xl border-4 border-blue-100 bg-blue-50/50 p-6 shadow-inner">
          <div className="mb-2 text-5xl font-black text-blue-600 drop-shadow-md sm:text-7xl">
            {score}
          </div>
          <div className="text-sm font-bold uppercase tracking-wide text-blue-700 sm:text-base">
            Điểm Khám Phá
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-bold text-emerald-700 shadow-sm sm:px-6 sm:text-lg">
            <span className="text-xl">✅</span>
            <span>{correctCount}</span>
            <span>Đúng</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 font-bold text-rose-700 shadow-sm sm:px-6 sm:text-lg">
            <span className="text-xl">❌</span>
            <span>{wrongCount}</span>
            <span>Sai</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 font-bold text-sky-700 shadow-sm sm:px-6 sm:text-lg">
            <span className="text-xl">🎯</span>
            <span>{totalCount}</span>
            <span>Câu</span>
          </div>
        </div>

        <div className={`grid gap-4 ${onChooseOtherGame ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-lg font-black text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 sm:text-xl"
          >
            🔄 Chơi lại nhé
          </button>

          {onChooseOtherGame && (
            <button
              onClick={onChooseOtherGame}
              className="flex items-center justify-center gap-2 rounded-[24px] border-4 border-blue-100 bg-white px-6 py-4 text-lg font-black text-blue-600 shadow-lg transition-all hover:border-blue-300 hover:bg-blue-50 active:scale-95 sm:text-xl"
            >
              🎮 Chọn Game Khác
            </button>
          )}
        </div>
      </section>
    </div>
  );
}