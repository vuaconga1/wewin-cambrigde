"use client";

import { BookUnitsSidebar } from "@/app/components/games/BookUnitsSidebar";

type StarterUnitsSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  basePath?: string;
};

/**
 * Sidebar cho Starter Book
 */
export function StarterUnitsSidebar({ isOpen = false, onClose, basePath = "/resources/starters/Games" }: StarterUnitsSidebarProps) {
  return (
    <BookUnitsSidebar
      bookType="starter"
      bookName="Kids Book"
      basePath={basePath}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

