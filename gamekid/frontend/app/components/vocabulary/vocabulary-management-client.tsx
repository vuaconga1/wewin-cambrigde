"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, BookOpenText, Plus, Search } from "lucide-react";
import axiosClient from "@/lib/auth/axios";
import { Routes } from "@/lib/constants/routes";
import Button from "@/app/components/button";
import { BackButton } from "@/app/components/backButton";
import ReusableTable from "@/app/components/table";
import { Pagination, RowsPerPage } from "@/app/components/pagination";

type VocabularyItemRow = {
  id: string;
  bookType: string;
  gameSlug: string;
  unit: string;
  unitTitle: string;
  sectionId?: string | null;
  sectionTitle?: string | null;
  wordId: string;
  word: string;
  emoji?: string | null;
  meaning?: string | null;
  link?: string | null;
  audioUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  createAt?: string;
  updateAt?: string;
};

type VocabularyFormState = {
  bookType: string;
  gameSlug: string;
  unit: string;
  unitTitle: string;
  sectionId: string;
  sectionTitle: string;
  wordId: string;
  word: string;
  emoji: string;
  meaning: string;
  link: string;
  audioUrl: string;
  sortOrder: string;
  isActive: boolean;
};

type NoticeState = {
  type: "success" | "error";
  text: string;
} | null;

const DEFAULT_FORM_STATE: VocabularyFormState = {
  bookType: "kids",
  gameSlug: "",
  unit: "",
  unitTitle: "",
  sectionId: "",
  sectionTitle: "",
  wordId: "",
  word: "",
  emoji: "",
  meaning: "",
  link: "",
  audioUrl: "",
  sortOrder: "0",
  isActive: true,
};

function getErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "Không thể thực hiện thao tác.";
  }

  const response = error as { response?: { data?: { message?: string } | string } };
  const message = response.response?.data;

  if (typeof message === "string") return message;
  if (message && typeof message === "object" && "message" in message) {
    return message.message ?? "Không thể thực hiện thao tác.";
  }

  return "Không thể thực hiện thao tác.";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      <span>
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function toFormState(item: VocabularyItemRow): VocabularyFormState {
  return {
    bookType: item.bookType ?? "kids",
    gameSlug: item.gameSlug ?? "",
    unit: item.unit ?? "",
    unitTitle: item.unitTitle ?? "",
    sectionId: item.sectionId ?? "",
    sectionTitle: item.sectionTitle ?? "",
    wordId: item.wordId ?? "",
    word: item.word ?? "",
    emoji: item.emoji ?? "",
    meaning: item.meaning ?? "",
    link: item.link ?? "",
    audioUrl: item.audioUrl ?? "",
    sortOrder: String(item.sortOrder ?? 0),
    isActive: item.isActive !== false,
  };
}

export function VocabularyManagementClient() {
  const router = useRouter();

  const [items, setItems] = useState<VocabularyItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPage>(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItemRow | null>(null);
  const [form, setForm] = useState<VocabularyFormState>(DEFAULT_FORM_STATE);

  const loadItems = async () => {
    setLoading(true);

    try {
      const response = await axiosClient.get("/vocabulary-items");
      const data = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      setItems(data);
      setNotice(null);
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => {
      const haystack = [
        item.bookType,
        item.gameSlug,
        item.unit,
        item.unitTitle,
        item.sectionId ?? "",
        item.sectionTitle ?? "",
        item.wordId,
        item.word,
        item.meaning ?? "",
        item.link ?? "",
        item.audioUrl ?? "",
        item.emoji ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [items, search]);

  const total = filteredItems.length;
  const pageSize = rowsPerPage === "all" ? total || 1 : Number(rowsPerPage);
  const totalPages = rowsPerPage === "all" ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = rowsPerPage === "all" ? 0 : (safePage - 1) * pageSize;
  const endIndex = rowsPerPage === "all" ? total : startIndex + pageSize;
  const visibleItems = useMemo(
    () => filteredItems.slice(startIndex, endIndex),
    [filteredItems, startIndex, endIndex],
  );

  useEffect(() => {
    setPage(1);
  }, [search, rowsPerPage]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(DEFAULT_FORM_STATE);
    setModalOpen(true);
    setNotice(null);
  };

  const openEditModal = (item: VocabularyItemRow) => {
    setEditingItem(item);
    setForm(toFormState(item));
    setModalOpen(true);
    setNotice(null);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingItem(null);
    setForm(DEFAULT_FORM_STATE);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.bookType.trim() || !form.gameSlug.trim() || !form.unit.trim() || !form.unitTitle.trim()) {
      setNotice({ type: "error", text: "Vui lòng nhập book type, game slug, unit và unit title." });
      return;
    }

    if (!form.wordId.trim() || !form.word.trim()) {
      setNotice({ type: "error", text: "Vui lòng nhập wordId và từ vựng." });
      return;
    }

    const sortOrder = Number.parseInt(form.sortOrder, 10);
    const payload = {
      bookType: form.bookType.trim(),
      gameSlug: form.gameSlug.trim(),
      unit: form.unit.trim(),
      unitTitle: form.unitTitle.trim(),
      sectionId: form.sectionId.trim() || undefined,
      sectionTitle: form.sectionTitle.trim() || undefined,
      wordId: form.wordId.trim(),
      word: form.word.trim(),
      emoji: form.emoji.trim() || undefined,
      meaning: form.meaning.trim() || undefined,
      link: form.link.trim() || undefined,
      audioUrl: form.audioUrl.trim() || undefined,
      sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
      isActive: form.isActive,
    };

    setSaving(true);

    try {
      if (editingItem) {
        await axiosClient.put(`/vocabulary-items/${editingItem.id}`, payload);
        setNotice({ type: "success", text: "Đã cập nhật vocabulary item." });
      } else {
        await axiosClient.post("/vocabulary-items", payload);
        setNotice({ type: "success", text: "Đã tạo vocabulary item mới." });
      }

      setModalOpen(false);
      setEditingItem(null);
      setForm(DEFAULT_FORM_STATE);
      await loadItems();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: VocabularyItemRow) => {
    const confirmed = window.confirm(`Xóa từ vựng ${item.word}?`);
    if (!confirmed) return;

    try {
      await axiosClient.delete(`/vocabulary-items/${item.id}`);
      setNotice({ type: "success", text: "Đã xóa vocabulary item." });
      await loadItems();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    }
  };

  const activeCount = items.filter((item) => item.isActive !== false).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,75,169,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(255,153,51,0.18),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-[0_22px_70px_rgba(14,75,169,0.12)] backdrop-blur">
          <div className="flex flex-col gap-5 border-b border-blue-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <BackButton label="Quay lại bảng điều khiển" onClick={() => router.push(Routes.HOME)} />
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#0E4BA9]">
                  <BookOpenText className="h-4 w-4" />
                  Quản lý vocabulary_items
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  CRUD từ vựng và audio
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  Tạo, sửa, xóa và tìm kiếm các mục từ vựng đang lưu trong bảng `vocabulary_items`, bao gồm cả đường dẫn audio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Tổng mục</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{items.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Đang hoạt động</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Có audio</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{items.filter((item) => Boolean(item.audioUrl)).length}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 shadow-sm lg:max-w-xl">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo từ, game, unit, nghĩa hoặc audio"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <Button onClick={openCreateModal} leftIcon={<Plus />} variant="gradient" className="h-12 px-5 text-sm shadow-lg">
              Thêm vocabulary item
            </Button>
          </div>

          {notice && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/90 p-4 shadow-[0_22px_70px_rgba(14,75,169,0.10)] sm:p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-80 animate-pulse rounded-[24px] bg-slate-100" />
            </div>
          ) : (
            <ReusableTable<VocabularyItemRow>
              columns={["Từ", "Book/Game", "Unit/Section", "Audio", "Trạng thái"]}
              data={visibleItems}
              getKey={(item) => item.id}
              emptyText="Chưa có vocabulary item nào."
              renderRow={(item) => (
                <>
                  <td className="px-5 py-4 align-top">
                    <div className="font-semibold text-slate-900">{item.word}</div>
                    <div className="text-xs text-slate-500">{item.wordId}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.emoji || "—"}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-slate-700">
                    <div className="font-medium text-slate-900">{item.bookType}</div>
                    <div className="text-xs text-slate-500">{item.gameSlug}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-slate-700">
                    <div className="font-medium text-slate-900">{item.unitTitle}</div>
                    <div className="text-xs text-slate-500">
                      {item.unit} {item.sectionTitle ? `• ${item.sectionTitle}` : ""}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-slate-700">
                    <div className="font-medium text-slate-900">{item.audioUrl ? "Có" : "Không"}</div>
                    <div className="text-xs text-slate-500">{item.audioUrl || "—"}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-slate-700">
                    <div className="font-medium text-slate-900">{item.isActive !== false ? "Active" : "Inactive"}</div>
                    <div className="text-xs text-slate-500">{formatDate(item.updateAt ?? item.createAt)}</div>
                  </td>
                </>
              )}
              renderMobileCard={(item) => (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0E4BA9]">{item.word}</p>
                      <p className="text-xs text-slate-500">{item.wordId}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isActive !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {item.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-700">
                    <p><span className="font-medium">Book:</span> {item.bookType}</p>
                    <p><span className="font-medium">Game:</span> {item.gameSlug}</p>
                    <p><span className="font-medium">Unit:</span> {item.unitTitle}</p>
                    <p><span className="font-medium">Section:</span> {item.sectionTitle || "—"}</p>
                    <p><span className="font-medium">Audio:</span> {item.audioUrl || "—"}</p>
                    <p><span className="font-medium">Meaning:</span> {item.meaning || "—"}</p>
                  </div>
                </div>
              )}
              actions={{
                onEdit: openEditModal,
                onDisable: handleDelete,
              }}
            />
          )}

          <Pagination
            text="mục từ vựng"
            currentPage={page}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            total={total}
            selectedRows={rowsPerPage}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
            onRowsChange={(rows) => {
              setRowsPerPage(rows);
              setPage(1);
            }}
          />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/70 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E4BA9]">
                    {editingItem ? "Chỉnh sửa" : "Tạo mới"}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                    {editingItem ? "Cập nhật vocabulary item" : "Thêm vocabulary item"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Đóng
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Book type" required>
                  <input value={form.bookType} onChange={(event) => setForm((prev) => ({ ...prev, bookType: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Game slug" required>
                  <input value={form.gameSlug} onChange={(event) => setForm((prev) => ({ ...prev, gameSlug: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Unit" required>
                  <input value={form.unit} onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Unit title" required>
                  <input value={form.unitTitle} onChange={(event) => setForm((prev) => ({ ...prev, unitTitle: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Section ID">
                  <input value={form.sectionId} onChange={(event) => setForm((prev) => ({ ...prev, sectionId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Section title">
                  <input value={form.sectionTitle} onChange={(event) => setForm((prev) => ({ ...prev, sectionTitle: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Word ID" required>
                  <input value={form.wordId} onChange={(event) => setForm((prev) => ({ ...prev, wordId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Word" required>
                  <input value={form.word} onChange={(event) => setForm((prev) => ({ ...prev, word: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Emoji">
                  <input value={form.emoji} onChange={(event) => setForm((prev) => ({ ...prev, emoji: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Sort order">
                  <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Audio URL">
                  <input value={form.audioUrl} onChange={(event) => setForm((prev) => ({ ...prev, audioUrl: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Link">
                  <input value={form.link} onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white" />
                </Field>
                <Field label="Meaning">
                  <textarea value={form.meaning} onChange={(event) => setForm((prev) => ({ ...prev, meaning: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white md:col-span-2" />
                </Field>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-[#0E4BA9] focus:ring-[#0E4BA9]" />
                Đang hoạt động
              </label>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
                <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>Hủy</Button>
                <Button type="submit" variant="gradient" disabled={saving}>{saving ? "Đang lưu..." : editingItem ? "Cập nhật" : "Tạo mới"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}