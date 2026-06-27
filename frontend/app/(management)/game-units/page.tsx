"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  WandSparkles,
  ChevronDown,
} from "lucide-react";
import axiosClient from "@/lib/auth/axios";
import { Routes } from "@/lib/constants/routes";
import { gameService } from "@/services/game.service";
import type { UnitGameConfig } from "@/types/games";
import Button from "@/app/components/button";
import { BackButton } from "@/app/components/backButton";
import ReusableTable from "@/app/components/table";
import { Pagination, RowsPerPage } from "@/app/components/pagination";

type GameUnitRow = UnitGameConfig & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

type GameUnitFormState = {
  slug: string;
  name: string;
  unit: string;
  bookname: string;
  bookType: string;
  backgroundColor: string;
  enabledGamesText: string;
  useRotatingGame: boolean;
  flashcardsJson: string;
  wordOrderingJson: string;
  wordScrambleJson: string;
  partsJson: string;
};

type NoticeState = {
  type: "success" | "error";
  text: string;
} | null;

const BOOK_TYPE_OPTIONS = ["kids", "starter", "mover", "flyer"];

const DEFAULT_FLASHCARDS = {
  title: "",
  words: [],
};

const DEFAULT_WORD_ORDERING = {
  title: "",
  words: [],
};

const DEFAULT_WORD_SCRAMBLE = {
  title: "",
  words: [],
};

function prettyJson(value: unknown, fallback = "") {
  if (value === undefined || value === null) return fallback;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return fallback;
  }
}

function parseJson(text: string, fallback: unknown) {
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  return JSON.parse(trimmed);
}

function createDefaultFormState(): GameUnitFormState {
  return {
    slug: "",
    name: "",
    unit: "",
    bookname: "",
    bookType: "kids",
    backgroundColor: "",
    enabledGamesText: "flip,speak",
    useRotatingGame: false,
    flashcardsJson: JSON.stringify(DEFAULT_FLASHCARDS, null, 2),
    wordOrderingJson: JSON.stringify(DEFAULT_WORD_ORDERING, null, 2),
    wordScrambleJson: JSON.stringify(DEFAULT_WORD_SCRAMBLE, null, 2),
    partsJson: "[]",
  };
}

function toFormState(unit: GameUnitRow): GameUnitFormState {
  return {
    slug: unit.slug ?? "",
    name: unit.name ?? "",
    unit: unit.unit ?? "",
    bookname: unit.bookname ?? "",
    bookType: unit.bookType ?? "kids",
    backgroundColor: unit.backgroundColor ?? "",
    enabledGamesText: Array.isArray(unit.enabledGames)
      ? unit.enabledGames.join(", ")
      : "",
    useRotatingGame: Boolean(unit.useRotatingGame),
    flashcardsJson: prettyJson(unit.flashcards, JSON.stringify(DEFAULT_FLASHCARDS, null, 2)),
    wordOrderingJson: prettyJson(
      unit.wordOrdering,
      JSON.stringify(DEFAULT_WORD_ORDERING, null, 2),
    ),
    wordScrambleJson: prettyJson(
      unit.wordScramble,
      JSON.stringify(DEFAULT_WORD_SCRAMBLE, null, 2),
    ),
    partsJson: prettyJson(unit.parts, "[]"),
  };
}

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

export default function GameUnitsManagementPage() {
  const router = useRouter();

  const [units, setUnits] = useState<GameUnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPage>(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<GameUnitRow | null>(null);
  const [form, setForm] = useState<GameUnitFormState>(createDefaultFormState());

  const loadUnits = async () => {
    setLoading(true);

    try {
      const data = await gameService.getAllGames();
      setUnits(Array.isArray(data) ? (data as GameUnitRow[]) : []);
      setNotice(null);
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUnits();
  }, []);

  const filteredUnits = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return units;

    return units.filter((unit) => {
      const haystack = [
        unit.slug,
        unit.name,
        unit.unit,
        unit.bookname,
        unit.bookType,
        Array.isArray(unit.enabledGames) ? unit.enabledGames.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [search, units]);

  const total = filteredUnits.length;
  const pageSize = rowsPerPage === "all" ? total || 1 : Number(rowsPerPage);
  const totalPages = rowsPerPage === "all" ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = rowsPerPage === "all" ? 0 : (safePage - 1) * pageSize;
  const endIndex = rowsPerPage === "all" ? total : startIndex + pageSize;
  const visibleUnits = useMemo(
    () => filteredUnits.slice(startIndex, endIndex),
    [filteredUnits, startIndex, endIndex],
  );

  useEffect(() => {
    setPage(1);
  }, [search, rowsPerPage]);

  const openCreateModal = () => {
    setEditingUnit(null);
    setForm(createDefaultFormState());
    setModalOpen(true);
    setNotice(null);
  };

  const openEditModal = (unit: GameUnitRow) => {
    setEditingUnit(unit);
    setForm(toFormState(unit));
    setModalOpen(true);
    setNotice(null);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingUnit(null);
    setForm(createDefaultFormState());
  };

  const buildPayload = () => {
    const enabledGames = form.enabledGamesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (enabledGames.length === 0) {
      throw new Error("Vui lòng nhập ít nhất một game trong enabledGames.");
    }

    return {
      slug: form.slug.trim(),
      name: form.name.trim(),
      unit: form.unit.trim(),
      bookname: form.bookname.trim(),
      bookType: form.bookType.trim(),
      backgroundColor: form.backgroundColor.trim() || undefined,
      enabledGames: enabledGames as any,
      useRotatingGame: form.useRotatingGame,
      flashcards: parseJson(form.flashcardsJson, DEFAULT_FLASHCARDS),
      wordOrdering: parseJson(form.wordOrderingJson, null),
      wordScramble: parseJson(form.wordScrambleJson, null),
      parts: parseJson(form.partsJson, null),
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.slug.trim() || !form.name.trim() || !form.unit.trim() || !form.bookname.trim()) {
      setNotice({ type: "error", text: "Vui lòng nhập slug, tên, unit và bookname." });
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      if (editingUnit) {
        await gameService.updateGameUnit(editingUnit.id, payload);
        setNotice({ type: "success", text: "Đã cập nhật game unit." });
      } else {
        await gameService.createGameUnit(payload);
        setNotice({ type: "success", text: "Đã tạo game unit mới." });
      }

      setModalOpen(false);
      setEditingUnit(null);
      setForm(createDefaultFormState());
      await loadUnits();
    } catch (error) {
      const message = error instanceof Error ? error.message : getErrorMessage(error);
      setNotice({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit: GameUnitRow) => {
    const confirmed = window.confirm(`Xóa game unit ${unit.name}?`);
    if (!confirmed) return;

    try {
      await gameService.deleteGameUnit(unit.id);
      setNotice({ type: "success", text: "Đã xóa game unit." });
      await loadUnits();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    }
  };

  const kidsCount = units.filter((unit) => unit.bookType === "kids").length;
  const starterCount = units.filter((unit) => unit.bookType === "starter").length;
  const moverCount = units.filter((unit) => unit.bookType === "mover").length;
  const flyerCount = units.filter((unit) => unit.bookType === "flyer").length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-[0_22px_70px_rgba(14,75,169,0.12)] backdrop-blur">
        <div className="flex flex-col gap-5 border-b border-blue-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <BackButton label="Quay lại bảng điều khiển" onClick={() => router.push(Routes.HOME)} />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#0E4BA9]">
                <WandSparkles className="h-4 w-4" />
                Quản lý game units
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                CRUD cho bảng game_units
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Tạo, sửa và xóa dữ liệu game units trực tiếp từ giao diện quản trị. Các trường JSON vẫn chỉnh được ngay trên form để đồng bộ với cấu trúc DB hiện tại.
              </p>
            </div>
          </div>

          <Button leftIcon={<Plus />} variant="gradient" onClick={openCreateModal}>
            Thêm game unit
          </Button>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Tổng units" value={units.length} accent="from-[#0E4BA9] to-[#00A6FB]" />
          <StatCard label="Kids" value={kidsCount} accent="from-emerald-500 to-teal-500" />
          <StatCard label="Starter" value={starterCount} accent="from-amber-500 to-orange-500" />
          <StatCard label="Mover" value={moverCount} accent="from-fuchsia-500 to-pink-500" />
          <StatCard label="Flyer" value={flyerCount} accent="from-slate-700 to-slate-500" />
        </div>

        <div className="flex flex-col gap-3 border-t border-blue-100 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo slug, tên, unit, bookname, bookType hoặc enabledGames"
              className="w-full rounded-2xl border border-blue-100 bg-slate-50 px-11 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0E4BA9] focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <Button variant="outline" onClick={loadUnits} disabled={loading}>
            Làm mới dữ liệu
          </Button>
        </div>

        {notice && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {notice.text}
          </div>
        )}

        <div className="mt-5">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-6 py-16 text-center text-slate-500">
              Đang tải danh sách game units...
            </div>
          ) : (
            <ReusableTable<GameUnitRow>
              columns={[
                "Slug",
                "Tên",
                "Unit",
                "Book",
                "Book type",
                "Enabled games",
                "Cập nhật",
                "Hành động",
              ]}
              data={visibleUnits}
              getKey={(row) => row.id}
              emptyText="Chưa có game unit nào."
              renderRow={(unit) => (
                <>
                  <td className="px-4 py-4 text-center align-top text-sm font-medium text-slate-900">{unit.slug}</td>
                  <td className="px-4 py-4 text-center align-top text-sm text-slate-700">{unit.name}</td>
                  <td className="px-4 py-4 text-center align-top text-sm text-slate-700">{unit.unit}</td>
                  <td className="px-4 py-4 text-center align-top text-sm text-slate-700">{unit.bookname}</td>
                  <td className="px-4 py-4 text-center align-top text-sm text-slate-700">{unit.bookType}</td>
                  <td className="px-4 py-4 text-center align-top text-sm text-slate-700">
                    {Array.isArray(unit.enabledGames) ? unit.enabledGames.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-4 text-center align-top text-sm text-slate-500">
                    {unit.updatedAt ? new Date(unit.updatedAt).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(unit)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white transition hover:bg-amber-600"
                        aria-label="Sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(unit)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white transition hover:bg-rose-600"
                        aria-label="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </>
              )}
              renderMobileCard={(unit) => (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-blue-600">{unit.bookType}</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">{unit.name}</h3>
                      <p className="text-sm text-slate-500">{unit.slug}</p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 px-3 py-2 text-right text-xs text-slate-600">
                      <p className="font-semibold text-slate-900">{unit.unit}</p>
                      <p>{unit.bookname}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">Enabled</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {Array.isArray(unit.enabledGames) ? unit.enabledGames.join(", ") : "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">Updated</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {unit.updatedAt ? new Date(unit.updatedAt).toLocaleDateString("vi-VN") : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" leftIcon={<Pencil />} onClick={() => openEditModal(unit)}>
                      Sửa
                    </Button>
                    <Button className="flex-1" variant="danger" leftIcon={<Trash2 />} onClick={() => void handleDelete(unit)}>
                      Xóa
                    </Button>
                  </div>
                </div>
              )}
            />
          )}
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          total={total}
          selectedRows={rowsPerPage}
          text="game units"
          onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          onRowsChange={(rows) => setRowsPerPage(rows)}
        />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(7,19,38,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                  Game units
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {editingUnit ? "Chỉnh sửa game unit" : "Tạo game unit mới"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(92vh-72px)] overflow-y-auto px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Slug" value={form.slug} onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))} required />
                <Field label="Tên" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} required />
                <Field label="Unit" value={form.unit} onChange={(value) => setForm((prev) => ({ ...prev, unit: value }))} required />
                <Field label="Bookname" value={form.bookname} onChange={(value) => setForm((prev) => ({ ...prev, bookname: value }))} required />

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Book type</span>
                  <select
                    value={form.bookType}
                    onChange={(event) => setForm((prev) => ({ ...prev, bookType: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#0E4BA9] focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    {BOOK_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <Field
                  label="Background color"
                  value={form.backgroundColor}
                  onChange={(value) => setForm((prev) => ({ ...prev, backgroundColor: value }))}
                  placeholder="from-blue-50 via-purple-50 to-pink-50"
                />

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.useRotatingGame}
                    onChange={(event) => setForm((prev) => ({ ...prev, useRotatingGame: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-[#0E4BA9] focus:ring-[#0E4BA9]"
                  />
                  Dùng rotating game
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-3">
                  <span>Enabled games</span>
                  <input
                    value={form.enabledGamesText}
                    onChange={(event) => setForm((prev) => ({ ...prev, enabledGamesText: event.target.value }))}
                    placeholder="flip, speak"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#0E4BA9] focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <JsonField
                  label="Flashcards JSON"
                  value={form.flashcardsJson}
                  onChange={(value) => setForm((prev) => ({ ...prev, flashcardsJson: value }))}
                />
                <JsonField
                  label="Word ordering JSON"
                  value={form.wordOrderingJson}
                  onChange={(value) => setForm((prev) => ({ ...prev, wordOrderingJson: value }))}
                />
                <JsonField
                  label="Word scramble JSON"
                  value={form.wordScrambleJson}
                  onChange={(value) => setForm((prev) => ({ ...prev, wordScrambleJson: value }))}
                />
                <JsonField
                  label="Parts JSON"
                  value={form.partsJson}
                  onChange={(value) => setForm((prev) => ({ ...prev, partsJson: value }))}
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={closeModal} disabled={saving}>
                  Hủy
                </Button>
                <Button type="submit" variant="gradient" disabled={saving} rightIcon={<ChevronDown className="rotate-[-90deg]" />}>
                  {saving ? "Đang lưu..." : "Lưu game unit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4 shadow-sm">
      <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      <span>
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#0E4BA9] focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function JsonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={10}
        className="w-full rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-[#0E4BA9] focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}