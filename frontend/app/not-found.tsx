"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Home, ArrowLeft, Globe } from "lucide-react";
import { Routes } from "../lib/constants/routes";
import { trackEvent, trackOutboundToMainSite } from "../lib/gtag";

export default function NotFoundPage() {
  const [particles, setParticles] = useState<{ left: string; top: string }[]>([]);

  useEffect(() => {
    // 1. Tạo hạt hiệu ứng background
    const generated = Array.from({ length: 8 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setParticles(generated);

    // 2. Gửi sự kiện 404 về GA4 để theo dõi URL hỏng/không tồn tại
    trackEvent("page_not_found", {
      page_path: typeof window !== "undefined" ? window.location.pathname : "",
      page_location: typeof window !== "undefined" ? window.location.href : "",
    });
  }, []);

  return (
    <div className="min-h-[calc(90vh-80px)] flex flex-col justify-center items-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 text-center px-4 sm:px-6 md:px-10 font-[Lexend] relative overflow-hidden">
      {/* 🔹 Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-40 sm:w-64 md:w-72 h-40 sm:h-64 md:h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"
        />
      </div>

      {/* 🔹 Main content */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl flex flex-col items-center"
      >
        {/* 404 title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "backOut", delay: 0.2 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-lg">
            404
          </h1>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl px-4 sm:px-8 md:px-12 py-6 sm:py-10 md:py-12 border border-white/50 w-full"
        >
          {/* Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center mb-4 sm:mb-6 md:mb-8"
          >
            <div className="bg-linear-to-br from-blue-500 to-indigo-600 text-white p-3 sm:p-4 md:p-5 rounded-2xl shadow-lg">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4"
          >
            Oops! Trang không tồn tại
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base md:text-lg px-2 sm:px-6 md:px-10"
          >
            Trang bạn đang tìm kiếm có thể đã bị di chuyển, xóa hoặc không còn tồn tại nữa.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <Link
              href={Routes.HOME}
              className="group bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-10 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Trang chủ
            </Link>

            <button
              onClick={() => window.history.back()}
              className="group bg-white text-gray-700 px-6 sm:px-10 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-indigo-300 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Quay lại
            </button>
          </motion.div>
        </motion.div>

        {/* Footer text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm md:text-base flex items-center justify-center gap-2"
        >
          <p>Hoặc truy cập website chính:</p>
          <a
            href="https://wewin.edu.vn"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutboundToMainSite("https://wewin.edu.vn")}
            className="font-medium text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
          >
            <Globe className="w-4 h-4" />
            wewin.edu.vn
          </a>
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-indigo-400 rounded-full"
          style={p}
        />
      ))}

      {/* ✨ Signature WeWIN với Outbound Tracking */}
      <a
        href="https://wewin.edu.vn"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackOutboundToMainSite("https://wewin.edu.vn")}
        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2 sm:gap-3 opacity-60 hover:opacity-100 transition-all duration-300"
      >
        <Image
          src="/assets/logo.png"
          alt="WeWIN Logo"
          width={32}
          height={32}
          className="rounded-full sm:w-8 sm:h-8"
        />
        <span className="text-xs sm:text-sm font-semibold text-[#0E4BA9] whitespace-nowrap">
          Powered by <span className="text-[#E4C28E]">WeWIN Education</span>
        </span>
      </a>
    </div>
  );
}
