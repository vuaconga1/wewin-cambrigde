import React from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import DetailContent from "./detailContent";
import type { ClassId } from "../../../lib/constants/types";

interface DetailPageProps {
  classId: ClassId;
  onGoBack: () => void;
}

export default function DetailPage({ classId, onGoBack }: DetailPageProps) {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Main Content với button bên trong */}
      <div className="relative">
        <button
          onClick={() => router.push("/games")}
          className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 lg:left-8 
          inline-flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 
          bg-[#0e4ba9] rounded-lg md:rounded-xl 
          text-sm sm:text-base text-white font-semibold 
          shadow-md hover:shadow-lg"
        >
          <span>←</span>
          <span>Back to level selection menu</span>
        </button>

        <DetailContent classId={classId} />
      </div>

      {/* Sidebar */}
      <Sidebar classId={classId} />
    </div>
  );
}