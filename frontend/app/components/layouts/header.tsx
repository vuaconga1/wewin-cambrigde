"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FolderOpen,
  X,
  Sparkles,
  ChevronDown,
  Gamepad2,
  LockKeyhole,
  LibraryBig,
  Warehouse,
  School,
  Users,
  History,
  ListChecks,
  List,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Routes } from "@/lib/constants/routes";
import type { Dispatch, SetStateAction } from "react";
import { handleLogout } from "@/lib/auth/logout";
import { useAuthStore } from "@/stores/auth.store";
import { useStudentStore } from "@/stores/student.store";
import { PERMISSIONS } from "@/lib/constants/permission";

export default function Navbar() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const user = useAuthStore((s) => s.user);
  const studentSession = useStudentStore((s) => s.session);
  const clearStudentSession = useStudentStore((s) => s.clearSession);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const NAVBAR_HEIGHT = 80;

  // 🔹 Hiệu ứng ẩn/hiện khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setShowNavbar(current < lastScrollY || current < 50);
      setLastScrollY(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // 🔹 Khóa scroll body khi menu mở
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  // Menu items cho desktop dropdown (có cả Books và Games)
  const menuItems = [
    {
      href: Routes.RESOURCES,
      label: "Books",
      icon: <BookOpen className="w-5 h-5 text-amber-300" />,
    },
    {
      href: Routes.RESOURCES_GAMES,
      label: "Games",
      icon: <Gamepad2 className="w-5 h-5 text-amber-300" />,
    },
  ];

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          y: showNavbar ? 0 : -NAVBAR_HEIGHT,
          opacity: showNavbar ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 32,
          mass: 0.9,
        }}
        className="fixed top-0 left-0 right-0 z-50
                 h-20
                 bg-linear-to-r from-[#0a1435] via-[#122b6b] to-[#0a1435]
                 border-b border-white/10 shadow-lg shadow-[#0a1435]/30"
      >
        <div
          className="max-w-8xl mx-auto flex items-center justify-between 
                            px-4 sm:px-6 md:px-8 lg:px-10 py-3 gap-3"
        >
          {/* 🔹 Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Logo />
          </div>

          {/* 🔹 Menu chính desktop */}
          <div className="hidden lg:flex items-center justify-center gap-6 mx-auto">
            {/* Nút Games cho người chưa đăng nhập */}
            {(!user || user === null) && (
              <Link href={Routes.RESOURCES_GAMES}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl
                        bg-transparent text-white font-bold shadow-lg hover:shadow-xl
                        transition-all duration-300 border border-white/40
                        hover:bg-white/10 hover:border-white/70 backdrop-blur-sm"
                >
                  <Gamepad2 className="w-5 h-5 text-white" />
                  <span>Games</span>
                </motion.button>
              </Link>
            )}

            {/* Dropdown Resources cho người đã đăng nhập (không phải admin) */}
            {!!user && (
              <div
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                   bg-white/10 hover:bg-white/20 backdrop-blur-md
                   border border-white/20 text-white font-semibold
                   transition-all shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tài nguyên</span>

                  <motion.div
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                {/* ⭐ DROPDOWN MENU */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-72 z-20
                       bg-linear-to-br from-[#0a1435]/95 via-[#122b6b]/95 to-[#1c3a88]/95
                       rounded-2xl shadow-2xl border border-white/15
                       backdrop-blur-xl overflow-hidden"
                    >
                      <div className="p-3 space-y-1">
                        {menuItems.map((item, index) => (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.03 * index }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setDropdownOpen(false)}
                              className="group flex items-center gap-3 px-4 py-3 rounded-xl
                               bg-white/5 hover:bg-white/15 border border-white/10
                               transition-all duration-200 hover:scale-[1.02]
                               hover:shadow-lg"
                            >
                              <span className="text-xl group-hover:scale-110 transition-transform">
                                {item.icon}
                              </span>
                              <span className="text-white font-medium text-sm flex-1">
                                {item.label}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          {/* 🔹 User / Login */}
          <div className="flex items-center gap-3 shrink-0">
            <UserSection
              user={user}
              studentSession={studentSession}
              onClearStudent={clearStudentSession}
            />
            <BurgerButton menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          </div>
        </div>
      </motion.nav>

      <div className="h-20" aria-hidden />

      {/* 🔹 Mobile Menu - Fixed fullscreen overlay */}
      <MobileMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hasPermission={hasPermission}
        user={user}
        studentSession={studentSession}
        onClearStudent={clearStudentSession}
      />

      {/* spacer tránh bị che */}
    </>
  );
}

/* 🔹 Components phụ tách gọn */

function Logo() {
  return (
    <>
      <Link href={Routes.HOME} className="ml-2 sm:block relative group">
        <div
          className="absolute inset-0 bg-linear-to-r from-amber-300 via-yellow-300 to-amber-300
                        rounded-full blur-lg opacity-0 group-hover:opacity-60 
                        transition-opacity duration-300"
        />
        <Image
          src="/logo.png"
          alt="WeWIN Logo"
          width={200}
          height={180}
          className="relative p-1.5 shadow-md transition-all duration-300
                     group-hover:scale-105"
        />
      </Link>
    </>
  );
}

type UserSectionProps = {
  user: {
    name?: string;
    email?: string;
  } | null;
  studentSession: { playerId: string; name: string } | null;
  onClearStudent: () => void;
};

function UserSection({ user, studentSession, onClearStudent }: UserSectionProps) {
  const router = useRouter();

  if (!user && studentSession) {
    return (
      <div className="hidden lg:flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl
                     bg-white/10 backdrop-blur-md text-white 
                     border border-white/20 shadow-lg"
        >
          <div
            className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 via-teal-500 to-cyan-500
                        flex items-center justify-center text-white font-bold text-sm shadow-lg
                        ring-2 ring-white/30"
          >
            {studentSession.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">
              {studentSession.name}
            </span>
            <span className="text-xs text-blue-100/70">
              ID: {studentSession.playerId}
            </span>
          </div>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearStudent}
          className="px-5 py-2.5 rounded-xl font-bold shadow-lg
                     bg-white/15 text-white hover:bg-white/25
                     transition-all border border-white/30"
        >
          Đổi ID
        </motion.button>
      </div>
    );
  }

  if (!user)
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push(Routes.LOGIN)}
        className="hidden lg:flex items-center gap-2 
                   px-6 py-2.5 rounded-xl font-bold
                   bg-linear-to-r from-amber-400 via-yellow-400 to-amber-400
                   text-blue-900 shadow-lg hover:shadow-xl
                   hover:from-amber-300 hover:via-yellow-300 hover:to-amber-300
                   transition-all duration-300 border border-amber-300/50"
      >
        <LockKeyhole className="w-5 h-5" />
        <span>Đăng nhập</span>
      </motion.button>
    );

  return (
    <div className="hidden lg:flex items-center gap-3">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 px-5 py-2.5 rounded-xl
                   bg-white/10 backdrop-blur-md text-white 
                   border border-white/20 shadow-lg"
      >
        <div
          className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 via-yellow-500 to-orange-500
                      flex items-center justify-center text-white font-bold text-sm shadow-lg
                      ring-2 ring-white/30"
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-tight">{user?.name}</span>
          <span className="text-xs text-blue-100/70">{user?.email}</span>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleLogout()}
        className="px-5 py-2.5 rounded-xl font-bold shadow-lg
                   bg-linear-to-r from-amber-400 to-yellow-500
                   text-blue-900 hover:from-amber-300 hover:to-yellow-400
                   transition-all border border-amber-300/50"
      >
        Đăng xuất
      </motion.button>
    </div>
  );
}

type BurgerButtonProps = {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
};

function BurgerButton({ menuOpen, setMenuOpen }: BurgerButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => setMenuOpen(!menuOpen)}
      className={`relative w-11 h-11 flex items-center justify-center rounded-xl 
                  transition-all duration-300 lg:hidden z-60
        ${
          menuOpen
            ? "bg-linear-to-br from-amber-400 to-yellow-500 shadow-lg"
            : "bg-white/10 hover:bg-white/20 backdrop-blur-md shadow-inner border border-white/20"
        }`}
    >
      <motion.span
        animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
        transition={{ duration: 0.25 }}
        className="absolute w-6 h-0.75 rounded-full bg-white"
      />
      <motion.span
        animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="absolute w-6 h-0.75 rounded-full bg-white"
      />
      <motion.span
        animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
        transition={{ duration: 0.25 }}
        className="absolute w-6 h-0.75 rounded-full bg-white"
      />
    </motion.button>
  );
}

type MobileMenuProps = {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  hasPermission: (permission: string) => boolean;
  user: {
    name?: string;
    email?: string;
  } | null;
  studentSession: { playerId: string; name: string } | null;
  onClearStudent: () => void;
};

function MobileMenu({
  menuOpen,
  setMenuOpen,
  hasPermission,
  user,
  studentSession,
  onClearStudent,
}: MobileMenuProps) {
  if (!menuOpen) return null;

  const canViewClassList = hasPermission(PERMISSIONS.CLASS_VIEW_LIST);
  const canViewClassCategory = hasPermission(PERMISSIONS.CLASS_CATEGORY_VIEW);
  const canViewStudent = hasPermission(PERMISSIONS.STUDENT_VIEW);
  const canViewStorageList = hasPermission(PERMISSIONS.STORAGE_VIEW_LIST);
  const canViewStorageApprove = hasPermission(PERMISSIONS.STORAGE_APPROVE_VIEW);
  const canViewStorageHistory = hasPermission(PERMISSIONS.STORAGE_HISTORY_VIEW);
  const canViewClass = canViewClassList || canViewClassCategory;
  const canViewStorage =
    canViewStorageList || canViewStorageApprove || canViewStorageHistory;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-linear-to-br from-black/60 via-black/40 to-black/60 
                   backdrop-blur-sm z-55 lg:hidden"
        onClick={() => setMenuOpen(false)}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="
            absolute right-0 top-0
            w-[320px]
            h-dvh
            max-h-screen
            bg-linear-to-br from-[#0a1435] via-[#122b6b] to-[#1c3a88]
            shadow-2xl
            overflow-y-auto
            overscroll-contain
            touch-pan-y
          "
        >
          {/* Header với Close Button */}
          <div
            className="sticky top-0 z-10 bg-linear-to-r from-[#0a1435]/95 to-[#122b6b]/95 
                          backdrop-blur-lg border-b border-white/10 px-6 py-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-yellow-500 
                                flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    WeWIN Education
                  </h2>
                  <p className="text-xs text-blue-100/70">Learning Resources</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 
                           flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          <div className="px-4 py-6 space-y-4 pb-20">
            {/* User Card */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-white/20 
                           bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl 
                           p-4 shadow-xl"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br 
                                from-yellow-400/20 to-transparent rounded-full blur-2xl"
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-400 via-yellow-500 to-orange-500
                                  flex items-center justify-center text-white font-black text-xl 
                                  shadow-lg ring-2 ring-white/30"
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base truncate">
                      {user?.name}
                    </p>
                    <p className="text-blue-100/60 text-xs truncate mt-0.5">
                      {user?.email}
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="mt-3 w-full px-4 py-2 rounded-xl font-semibold text-sm
                               bg-linear-to-r from-amber-400 to-yellow-500
                               text-blue-900 hover:from-amber-300 hover:to-yellow-400
                               transition-all shadow-lg hover:shadow-xl"
                    >
                      Đăng xuất
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Học sinh (đã nhập ID) */}
            {!user && studentSession && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-white/20 
                           bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl 
                           p-4 shadow-xl"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 via-teal-500 to-cyan-500
                                  flex items-center justify-center text-white font-black text-xl shadow-lg"
                  >
                    {studentSession.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base truncate">
                      {studentSession.name}
                    </p>
                    <p className="text-blue-100/60 text-xs truncate mt-0.5">
                      ID: {studentSession.playerId}
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        onClearStudent();
                        setMenuOpen(false);
                      }}
                      className="mt-3 w-full px-4 py-2 rounded-xl font-semibold text-sm
                               bg-white/15 text-white hover:bg-white/25
                               transition-all border border-white/30"
                    >
                      Đổi ID
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Login Button (giáo viên) */}
            {!user && !studentSession && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  window.location.href = Routes.LOGIN;
                  setMenuOpen(false);
                }}
                className="w-full px-5 py-4 rounded-2xl font-bold text-base
                         bg-linear-to-r from-white to-blue-50
                         text-[#1a5fb4] shadow-xl hover:shadow-2xl
                         transition-all border border-white/50
                         flex items-center justify-center gap-2"
              >
                <LockKeyhole className="w-5 h-5" />
                Đăng nhập
              </motion.button>
            )}

            {/* Resources/Games Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2">
                {user ? (
                  <BookOpen className="w-4 h-4 text-amber-300" />
                ) : (
                  <Gamepad2 className="w-4 h-4 text-amber-300" />
                )}
                <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  {user ? "Tài nguyên" : "Games"}
                </h3>
              </div>

              <div className="space-y-1.5">
                {/* GAMES – luôn cho khách */}
                {!user && (
                  <Link
                    href={Routes.RESOURCES_GAMES}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl
                 bg-white/5 hover:bg-white/15 border border-white/10"
                  >
                    <Gamepad2 className="w-5 h-5 text-amber-300" />
                    <span className="text-white font-medium text-sm">
                      Games
                    </span>
                  </Link>
                )}

                {/* BOOKS – chỉ user đã login */}
                {user && (
                  <Link
                    href={Routes.RESOURCES}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl
                 bg-white/5 hover:bg-white/15 border border-white/10"
                  >
                    <BookOpen className="w-5 h-5 text-amber-300" />
                    <span className="text-white font-medium text-sm">
                      Sách
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* ADMIN MENU */}
            {user && (
              <>
                {canViewClass && (
                  <div className="space-y-2 mt-6">
                    {canViewClassList && (
                      <div className="flex items-center gap-2 px-3 py-2">
                        <FolderOpen className="w-4 h-4 text-amber-300" />
                        <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                          Lớp học
                        </h3>
                      </div>
                    )}
                    {canViewClassCategory && (
                      <div className="space-y-1.5">
                        {[
                          {
                            href: Routes.MANAGE_CLASS,
                            label: "Danh sách",
                            icon: (
                              <LibraryBig className="w-5 h-5 text-amber-300" />
                            ),
                          },
                          {
                            href: Routes.MANAGE_CLASS_CATEGORY,
                            label: "Phân loại",
                            icon: (
                              <FolderOpen className="w-5 h-5 text-amber-300" />
                            ),
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * index }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setMenuOpen(false)}
                              className="group flex items-center gap-3 px-4 py-3 rounded-xl
                                   bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30
                                   transition-all duration-200 hover:scale-[1.02]"
                            >
                              <span className="text-2xl">{item.icon}</span>
                              <span className="text-white font-medium text-sm flex-1">
                                {item.label}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {canViewStudent && (
                  <div className="space-y-2 mt-6">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <School className="w-4 h-4 text-amber-300" />
                      <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                        Học viên
                      </h3>
                    </div>
                    <Link
                      href={Routes.MANAGE_STUDENT}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl
                             bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30
                             transition-all duration-200 hover:scale-[1.02]"
                    >
                      <Users className="w-5 h-5 text-amber-300" />
                      <span className="text-white font-medium text-sm flex-1">
                        Danh sách
                      </span>
                    </Link>
                  </div>
                )}

                {canViewStorage && (
                  <div className="space-y-2 mt-6">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Warehouse className="w-4 h-4 text-amber-300" />
                      <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                        Kho lưu trữ
                      </h3>
                    </div>
                    {canViewStorageList && (
                      <Link
                        href={Routes.MANAGE_STORAGE_LIST}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl
                             bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30
                             transition-all duration-200 hover:scale-[1.02]"
                      >
                        <List className="w-4 h-4 text-amber-300" />
                        <span className="text-white font-medium text-sm flex-1">
                          Danh sách
                        </span>
                      </Link>
                    )}
                    {canViewStorageApprove && (
                      <Link
                        href={Routes.MANAGE_STORAGE_REQUEST}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl
                             bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30
                             transition-all duration-200 hover:scale-[1.02]"
                      >
                        <ListChecks className="w-4 h-4 text-amber-300" />
                        <span className="text-white font-medium text-sm flex-1">
                          Chờ duyệt
                        </span>
                      </Link>
                    )}
                    {canViewStorageHistory && (
                      <Link
                        href={Routes.MANAGE_STORAGE_HISTORY}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl
                             bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30
                             transition-all duration-200 hover:scale-[1.02]"
                      >
                        <History className="w-4 h-4 text-amber-300" />
                        <span className="text-white font-medium text-sm flex-1">
                          Lịch sử
                        </span>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
