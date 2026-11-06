"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CirclePlus, Search, X } from "lucide-react";
import Button from "@/app/components/button";
import { Pagination, RowsPerPage } from "@/app/components/pagination";
import { Routes } from "@/lib/constants/routes";
import {
  classService,
  getApiErrorMessage,
  type ClassSummary,
} from "@/services/class.service";

export function ClassListClient() {
  const [items, setItems] = useState<ClassSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPage>(20);
  const [createOpen, setCreateOpen] = useState(false);

  const limit = rowsPerPage === "all" ? 100 : rowsPerPage;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await classService.list({ q: query || undefined, page, limit });
      setItems(res.items);
      setTotal(res.total);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query, page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-black">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#0E4BA9] lg:text-3xl">Quản lý lớp học</h1>
        <Button variant="gradient" leftIcon={<CirclePlus />} onClick={() => setCreateOpen(true)}>
          Thêm lớp
        </Button>
      </div>

      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã lớp, tên lớp, mô tả..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Mã lớp</th>
              <th className="px-4 py-3">Tên lớp</th>
              <th className="px-4 py-3 text-center">Học viên</th>
              <th className="px-4 py-3 text-center">Bài tập</th>
              <th className="px-4 py-3">Nguồn</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Chưa có lớp nào.
                </td>
              </tr>
            ) : (
              items.map((cls) => (
                <tr key={cls.id} className="border-t border-slate-100 hover:bg-blue-50/40">
                  <td className="px-4 py-3 font-mono text-xs">{cls.code ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={Routes.MANAGE_CLASS_DETAIL(cls.id)}
                      className="font-semibold text-[#0E4BA9] hover:underline"
                    >
                      {cls.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">{cls.memberCount}</td>
                  <td className="px-4 py-3 text-center">{cls.assignmentCount}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {cls.source === "drive" ? "Google Drive" : "Tạo tay"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        cls.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {cls.isActive ? "Đang học" : "Đã kết thúc"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        text="lớp"
        currentPage={page}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={startIndex + items.length}
        total={total}
        selectedRows={rowsPerPage}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        onRowsChange={(rows) => {
          setRowsPerPage(rows);
          setPage(1);
        }}
      />

      {createOpen && (
        <CreateClassModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

function CreateClassModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên lớp");
      return;
    }
    setSaving(true);
    try {
      await classService.create({
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
      });
      onCreated();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 text-black shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Thêm lớp</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <Field label="Tên lớp *">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Mã lớp">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={40}
            placeholder="VD: WW00250"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Mô tả">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="gradient" disabled={saving}>
            {saving ? "Đang lưu..." : "Tạo lớp"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
