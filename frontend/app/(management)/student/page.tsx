"use client";

import { useEffect, useState } from "react";
import { studentService } from "@/services/student.service";
import type { StudentSession } from "@/stores/student.store";

export default function StudentPage() {
  const [students, setStudents] = useState<StudentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerId, setPlayerId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await studentService.create({ playerId: playerId.trim(), name: name.trim() });
      setPlayerId("");
      setName("");
      await loadStudents();
    } catch {
      setError("Không thể tạo học sinh. Kiểm tra ID đã tồn tại hoặc quyền truy cập.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa học sinh này?")) return;
    try {
      await studentService.remove(id);
      await loadStudents();
    } catch {
      setError("Không thể xóa học sinh.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-blue-700">Quản lý học sinh</h1>
        <p className="text-gray-600 mt-1">
          Tạo ID người chơi cho học sinh. Học sinh dùng ID này khi vào Games (không cần đăng nhập).
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800">Thêm học sinh mới</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID người chơi
            </label>
            <input
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              maxLength={50}
              required
              placeholder="VD: HS001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên học sinh
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              placeholder="VD: Nguyễn Văn A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-[#1057C1] text-white font-semibold rounded-lg hover:bg-[#0c3e8c] disabled:opacity-60"
        >
          {submitting ? "Đang lưu..." : "Thêm học sinh"}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b">
          Danh sách học sinh
        </h2>
        {loading ? (
          <p className="px-6 py-8 text-gray-500">Đang tải...</p>
        ) : students.length === 0 ? (
          <p className="px-6 py-8 text-gray-500">Chưa có học sinh nào.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">ID người chơi</th>
                <th className="px-6 py-3 font-medium">Tên</th>
                <th className="px-6 py-3 font-medium w-24" />
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-6 py-3 font-mono text-sm">{s.playerId}</td>
                  <td className="px-6 py-3">{s.name}</td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => void handleDelete(s.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
