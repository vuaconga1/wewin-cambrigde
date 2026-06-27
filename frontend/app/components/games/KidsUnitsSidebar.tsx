"use client";

import { BookUnitsSidebar } from "@/app/components/games/BookUnitsSidebar";

type KidsUnitsSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  basePath?: string; // Mặc định: "/games/kids"
};

/**
 * Sidebar đơn giản cho các trang game lẻ Kids Book
 */
export function KidsUnitsSidebar({ isOpen = false, onClose, basePath = "/games/kids" }: KidsUnitsSidebarProps) {
  return (
    <BookUnitsSidebar
      bookType="kids"
      bookName="Kids Book"
      basePath={basePath}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
