"use client";

import { BookUnitsSidebar } from "@/app/components/games/BookUnitsSidebar";

type FlyerUnitsSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  basePath?: string;
};

export function FlyerUnitsSidebar({ isOpen = false, onClose, basePath = "/resources/flyer/Games" }: FlyerUnitsSidebarProps) {
  return (
    <BookUnitsSidebar
      bookType="flyer"
      bookName="Flyer Book"
      basePath={basePath}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

