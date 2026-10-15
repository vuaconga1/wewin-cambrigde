"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
};

type BookScreenProps = {
  bookName: string; // Tên cuốn sách (ví dụ: "Kids Book", "Starters Book")
  projects: Project[];
  basePath: string; // Base path cho routing (ví dụ: "/resources/kids/Games")
  defaultBackground?: string; // Background color mặc định
  onSelectProject?: (projectId: string) => void;
  renderProjectContent?: (project: Project | null) => React.ReactNode;
};

/**
 * Component generic cho bất kỳ cuốn sách nào
 * - Sidebar bên trái: danh sách Project
 * - Khu vực nội dung chính: hiển thị chào mừng hoặc nội dung theo project được chọn
 * 
 * Có thể tái sử dụng cho Kids Book, Starters Book, Movers Book, v.v.
 */
export function BookScreen({
  bookName,
  projects,
  basePath,
  defaultBackground = "bg-blue-50",
  onSelectProject,
  renderProjectContent,
}: BookScreenProps) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    onSelectProject?.(project.id);
    
    // Điều hướng đến trang riêng của unit
    router.push(`${basePath}/${project.id}`);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className={`flex min-h-screen flex-col md:flex-row overflow-x-hidden ${defaultBackground} text-brown-700`}>
      {/* Sidebar bên trái */}
      <aside className="flex w-full md:w-72 md:flex-shrink-0 flex-col border-b md:border-b-0 md:border-r border-pink-200 bg-pink-50 shadow-xl md:h-screen overflow-hidden">
        <div className="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-b border-pink-200/70 bg-pink-50">
          <span className="text-3xl">🌟</span>
          <div>
            <div className="text-lg font-extrabold text-pink-800 tracking-wide">
              {bookName}
            </div>
            <div className="text-xs font-medium text-pink-700">
              Chọn Project để bắt đầu
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-3 px-3">
          {projects.map((project) => {
            const isActive = project.id === selectedProjectId;
            return (
              <button
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className={`w-full rounded-3xl px-4 py-4 text-left text-base font-semibold transition-all shadow-sm border ${
                  isActive
                    ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white border-rose-300 shadow-lg scale-[1.01]"
                    : "bg-gradient-to-r from-pink-100 to-rose-50 text-pink-800 border-pink-200 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {project.name}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Khu vực nội dung */}
      <main className="min-w-0 flex-1 flex flex-col">
        {/* Nội dung chính */}
        <div className="flex-1 relative min-h-full">
          <div className={`absolute inset-0 ${defaultBackground}`} />

          {renderProjectContent ? (
            // Nếu truyền hàm render từ ngoài vào thì dùng nội dung đó (không căn giữa để cho phép scroll)
            <div className="relative w-full min-h-full">
              {renderProjectContent(selectedProject ?? null)}
            </div>
          ) : (
            // Hiển thị welcome message khi không có project nào được chọn
            <div className="relative flex h-full flex-col items-center justify-center px-6 sm:px-10 text-center">
              <div className="max-w-3xl rounded-3xl bg-white/80 shadow-xl px-6 py-8 sm:px-10 sm:py-10 border border-pink-100">
                <h1 className="mb-3 text-2xl sm:text-3xl font-extrabold text-pink-600">
                  📚 {bookName} Games
                </h1>
                <p className="text-sm sm:text-base text-pink-700 mb-4">
                  Chọn một Project từ sidebar để bắt đầu chơi game!
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {projects.slice(0, 5).map((project) => (
                    <span
                      key={project.id}
                      className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium"
                    >
                      {project.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

