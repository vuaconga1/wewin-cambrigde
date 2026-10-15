"use client";

import { memo } from "react";
import type { AnswerFeedbackState } from "@/app/components/games/useAnswerFeedback";

type Props = {
  feedback: AnswerFeedbackState | null;
  /** `flyUp` = bay từ dưới lên (Memory). Mặc định hiện giữa màn. */
  motion?: "center" | "flyUp";
};

const SPARKS = [
  { top: "-18%", left: "8%", delay: "0ms", size: "h-2.5 w-2.5" },
  { top: "-22%", left: "52%", delay: "40ms", size: "h-2 w-2" },
  { top: "-12%", left: "88%", delay: "80ms", size: "h-3 w-3" },
  { top: "38%", left: "-10%", delay: "60ms", size: "h-2 w-2" },
  { top: "42%", left: "104%", delay: "100ms", size: "h-2.5 w-2.5" },
  { top: "108%", left: "12%", delay: "50ms", size: "h-2 w-2" },
  { top: "112%", left: "55%", delay: "90ms", size: "h-3 w-3" },
  { top: "102%", left: "90%", delay: "30ms", size: "h-2 w-2" },
] as const;

function AnswerFeedbackInner({ feedback, motion: motionStyle = "center" }: Props) {
  if (!feedback) return null;

  const isCorrect = feedback.type === "correct";
  const isFlyUp = motionStyle === "flyUp";

  const animClass = isFlyUp
    ? "answer-feedback-fly-up"
    : isCorrect
      ? "answer-feedback-pop"
      : "answer-feedback-shake";

  return (
    <div
      className={`fixed inset-0 z-[100] flex justify-center pointer-events-none ${
        isFlyUp ? "items-end pb-[12vh]" : "items-center"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div key={feedback.id} className={`relative flex items-center justify-center ${animClass}`}>
        {/* Soft glow behind */}
        <span
          className={`answer-feedback-glow absolute inset-[-20%] rounded-full blur-2xl ${
            isCorrect ? "bg-emerald-400/45" : "bg-rose-400/45"
          }`}
          aria-hidden
        />

        {/* Expanding rings */}
        <span
          className={`answer-feedback-ring absolute inset-[-8%] rounded-[999px] border-2 ${
            isCorrect ? "border-emerald-400/70" : "border-rose-400/70"
          }`}
          aria-hidden
        />
        <span
          className={`answer-feedback-ring answer-feedback-ring-delay absolute inset-[-18%] rounded-[999px] border-2 ${
            isCorrect ? "border-emerald-300/50" : "border-rose-300/50"
          }`}
          aria-hidden
        />

        {/* Spark dots around */}
        {SPARKS.map((spark, i) => (
          <span
            key={i}
            className={`answer-feedback-spark absolute rounded-full ${spark.size} ${
              isCorrect ? "bg-emerald-400" : "bg-rose-400"
            }`}
            style={{
              top: spark.top,
              left: spark.left,
              animationDelay: spark.delay,
            }}
            aria-hidden
          />
        ))}

        {/* Tiny star bursts */}
        <span
          className={`answer-feedback-star absolute -top-5 left-1/2 -translate-x-1/2 text-xl ${
            isCorrect ? "text-amber-400" : "text-orange-400"
          }`}
          aria-hidden
        >
          ✦
        </span>
        <span
          className={`answer-feedback-star absolute top-1/2 -left-6 -translate-y-1/2 text-lg ${
            isCorrect ? "text-emerald-400" : "text-rose-400"
          }`}
          style={{ animationDelay: "70ms" }}
          aria-hidden
        >
          ✦
        </span>
        <span
          className={`answer-feedback-star absolute top-1/2 -right-6 -translate-y-1/2 text-lg ${
            isCorrect ? "text-lime-400" : "text-orange-400"
          }`}
          style={{ animationDelay: "110ms" }}
          aria-hidden
        >
          ✦
        </span>

        <div
          className={`relative z-10 px-8 py-4 sm:px-10 sm:py-5 rounded-[999px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] border-[3px] ${
            isCorrect
              ? "border-emerald-400 ring-4 ring-emerald-200/70"
              : "border-rose-400 ring-4 ring-rose-200/70"
          }`}
        >
          <p
            className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-center whitespace-nowrap ${
              isCorrect ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {feedback.phrase}
          </p>
        </div>
      </div>
    </div>
  );
}

export const AnswerFeedback = memo(AnswerFeedbackInner);
