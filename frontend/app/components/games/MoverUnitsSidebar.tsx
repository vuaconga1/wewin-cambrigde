"use client";

import { BookUnitsSidebar } from "@/app/components/games/BookUnitsSidebar";

type MoverUnitsSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  basePath?: string;
};

/**
 * Sidebar cho Mover Book
 */
export function MoverUnitsSidebar({ isOpen = false, onClose, basePath = "/resources/mover/Games" }: MoverUnitsSidebarProps) {
  return (
    <BookUnitsSidebar
      bookType="mover"
      bookName="Mover Book"
      basePath={basePath}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

