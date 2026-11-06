"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import Button from "@/app/components/button";
import ConfirmPopup from "@/app/components/confirmPopup";
import { Routes } from "@/lib/constants/routes";
import {
  classService,
  formatVnDateTime,
  getApiErrorMessage,
  isoToVnLocal,
  vnLocalToIso,
  type Catalog,
  type ClassAssignment,
  type ClassDetail,
  type ClassProgress,
  type ProgressCell,
  type StudentOption,
} from "@/services/class.service";
import { Field } from "./class-list-client";

const GAME_LABELS: Record<string, string> = {
  flip: "Flip Card",
  speak: "Pronunciation",
  memory: "Memory",
  ordering: "Word Ordering",
  scramble: "Word Scramble",
};

type Tab = "members" | "assignments" | "progress";

type Confirm = {
  title: string;
  description: string;
  action: () => Promise<void>;
} | null;

export function ClassDetailClient({ classId }: { classId: string }) {
  const router = useRouter();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("assignments");
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const load = useCallback(async () => {
    try {
      setCls(await classService.detail(classId));
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, [classId]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: () => Promise<void>, success?: string) => {
    try {
      await action();
      setError(null);
      if (success) setNotice(success);
      await load();
    } catch (err) {
      setNotice(null);
      setError(getApiErrorMessage(err));
    }
  };

  if (!cls) {
    return (
      <div className="mx-auto max-w-7xl p-6 text-slate-600">
        {error ?? "Đang tải..."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 text-black">
      <button
        type="button"
        onClick={() => router.push(Routes.MANAGE_CLASS)}
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-[#0E4BA9]"
      >
        <ArrowLeft className="h-4 w-4" /> Danh sách lớp
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="min-w-0">
          <p className="font-mono text-xs text-slate-500">{cls.code ?? "Chưa có mã"}</p>
          <h1 className="text-xl font-bold text-[#0E4BA9] lg:text-2xl">{cls.name}</h1>
          {cls.description && (
            <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{cls.description}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            {cls.members.length} học viên · {cls.assignments.length} bài tập ·{" "}
            {cls.isActive ? "Đang học" : "Đã kết thúc"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Pencil />} onClick={() => setEditOpen(true)}>
            Sửa
          </Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 />}
            onClick={() =>
              setConfirm({
                title: "Xóa lớp?",
                description: `Xóa lớp "${cls.name}" cùng toàn bộ bài tập đã giao. Kết quả chơi game của học viên vẫn được giữ.`,
                action: async () => {
                  await classService.remove(cls.id);
                  router.push(Routes.MANAGE_CLASS);
                },
              })
            }
          >
            Xóa
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </div>
      )}

      <div className="flex gap-1 rounded-xl bg-slate-200/60 p-1 text-sm font-medium">
        {(
          [
            ["assignments", "Bài tập"],
            ["members", "Học viên"],
            ["progress", "Tiến độ"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-3 py-2 ${
              tab === key ? "bg-white text-[#0E4BA9] shadow" : "text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <MembersTab
          cls={cls}
          onAdd={(ids) =>
            run(async () => {
              const { added } = await classService.addMembers(cls.id, ids);
              setNotice(`Đã thêm ${added} học viên`);
            })
          }
          onRemove={(m) =>
            setConfirm({
              title: "Gỡ học viên?",
              description: `Gỡ ${m.name} (${m.username}) khỏi lớp.`,
              action: () => classService.removeMember(cls.id, m.userId),
            })
          }
        />
      )}

      {tab === "assignments" && (
        <AssignmentsTab
          cls={cls}
          run={run}
          onDelete={(a) =>
            setConfirm({
              title: "Xóa bài tập?",
              description: `Xóa "${assignmentTitle(a)}". Học viên sẽ không còn thấy bài này.`,
              action: () => classService.removeAssignment(cls.id, a.id),
            })
          }
        />
      )}

      {tab === "progress" && <ProgressTab classId={cls.id} onError={setError} />}

      {editOpen && (
        <EditClassModal
          cls={cls}
          onClose={() => setEditOpen(false)}
          onSave={(payload) =>
            run(async () => {
              await classService.update(cls.id, payload);
              setEditOpen(false);
            }, "Đã lưu thông tin lớp")
          }
        />
      )}

      <ConfirmPopup
        visible={!!confirm}
        title={confirm?.title}
        description={confirm?.description}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const action = confirm?.action;
          setConfirm(null);
          if (action) void run(action);
        }}
      />
    </div>
  );
}

function assignmentTitle(a: Pick<ClassAssignment, "bookName" | "unitName" | "partTitle">) {
  return [a.bookName, a.unitName, a.partTitle].filter(Boolean).join(" · ");
}

/* ---------------- Sửa lớp ---------------- */

function EditClassModal({
  cls,
  onClose,
  onSave,
}: {
  cls: ClassDetail;
  onClose: () => void;
  onSave: (payload: { name: string; description: string; isActive: boolean }) => void;
}) {
  const [name, setName] = useState(cls.name);
  const [description, setDescription] = useState(cls.description ?? "");
  const [isActive, setIsActive] = useState(cls.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave({ name: name.trim(), description, isActive });
        }}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Sửa lớp</h2>
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
        <Field label="Mô tả">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Lớp đang học (bỏ chọn để ẩn bài tập khỏi học viên)
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="gradient">
            Lưu
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Học viên ---------------- */

function MembersTab({
  cls,
  onAdd,
  onRemove,
}: {
  cls: ClassDetail;
  onAdd: (userIds: string[]) => Promise<void>;
  onRemove: (m: ClassDetail["members"][number]) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<StudentOption[]>([]);
  const [selected, setSelected] = useState<StudentOption[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      classService
        .searchStudents(q.trim(), cls.id)
        .then((r) => !cancelled && setResults(r))
        .catch(() => !cancelled && setResults([]));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, cls.id, cls.members.length]);

  const toggle = (s: StudentOption) =>
    setSelected((prev) =>
      prev.some((p) => p.id === s.id) ? prev.filter((p) => p.id !== s.id) : [...prev, s],
    );

  const add = async () => {
    setAdding(true);
    await onAdd(selected.map((s) => s.id));
    setSelected([]);
    setAdding(false);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Thêm học viên</h3>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo Mã HV hoặc họ tên..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
              >
                {s.username}
                <button type="button" onClick={() => toggle(s)} aria-label="Bỏ chọn">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100">
          {results.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-slate-500">Không có kết quả</li>
          ) : (
            results.map((s) => (
              <li key={s.id}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selected.some((p) => p.id === s.id)}
                    onChange={() => toggle(s)}
                  />
                  <span className="font-mono text-xs text-slate-500">{s.username}</span>
                  <span>{s.name}</span>
                </label>
              </li>
            ))
          )}
        </ul>
        <Button
          variant="gradient"
          leftIcon={<UserPlus />}
          disabled={selected.length === 0 || adding}
          onClick={add}
          className="w-full"
        >
          Thêm {selected.length || ""} học viên
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 px-4 py-3 font-semibold">
          Học viên trong lớp ({cls.members.length})
        </h3>
        <ul className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto">
          {cls.members.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-slate-500">Lớp chưa có học viên.</li>
          ) : (
            cls.members.map((m) => (
              <li key={m.userId} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                <div className="min-w-0">
                  <span className="mr-2 font-mono text-xs text-slate-500">{m.username}</span>
                  <span className={m.isActive ? "" : "text-slate-400 line-through"}>{m.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(m)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Gỡ khỏi lớp"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Bài tập ---------------- */

type AssignRow = {
  key: number;
  bookType: string;
  unitSlug: string;
  partId: string;
  gameTypes: string[];
  deadline: string;
};

function defaultDeadline() {
  const inAWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return `${isoToVnLocal(inAWeek.toISOString()).slice(0, 10)}T21:00`;
}

function AssignmentsTab({
  cls,
  run,
  onDelete,
}: {
  cls: ClassDetail;
  run: (action: () => Promise<void>, success?: string) => Promise<void>;
  onDelete: (a: ClassAssignment) => void;
}) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [rows, setRows] = useState<AssignRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);

  useEffect(() => {
    classService.catalog().then(setCatalog).catch(() => setCatalog({ games: [], books: [] }));
  }, []);

  const newRow = useCallback(
    (prev?: AssignRow): AssignRow => ({
      key: Date.now() + Math.random(),
      bookType: prev?.bookType ?? catalog?.books[0]?.bookType ?? "",
      unitSlug: "",
      partId: "",
      gameTypes: catalog?.games ?? [],
      deadline: prev?.deadline ?? defaultDeadline(),
    }),
    [catalog],
  );

  useEffect(() => {
    if (catalog && rows.length === 0) setRows([newRow()]);
  }, [catalog, rows.length, newRow]);

  const updateRow = (key: number, patch: Partial<AssignRow>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const ready = rows.length > 0 && rows.every((r) => r.unitSlug && r.partId && r.gameTypes.length && r.deadline);

  const submit = async () => {
    setSaving(true);
    await run(async () => {
      await classService.createAssignments(
        cls.id,
        rows.map((r) => ({
          unitSlug: r.unitSlug,
          partId: r.partId,
          gameTypes: r.gameTypes,
          deadlineAt: vnLocalToIso(r.deadline),
        })),
      );
      setRows([newRow(rows[rows.length - 1])]);
    }, `Đã giao ${rows.length} bài`);
    setSaving(false);
  };

  const now = Date.now();

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Giao bài mới</h3>
        {!catalog ? (
          <p className="text-sm text-slate-500">Đang tải danh sách bài học...</p>
        ) : (
          <>
            {rows.map((row) => (
              <AssignRowEditor
                key={row.key}
                row={row}
                catalog={catalog}
                onChange={(patch) => updateRow(row.key, patch)}
                onRemove={
                  rows.length > 1
                    ? () => setRows((prev) => prev.filter((r) => r.key !== row.key))
                    : undefined
                }
              />
            ))}
            <div className="flex flex-wrap justify-between gap-2">
              <Button
                variant="outline"
                leftIcon={<Plus />}
                onClick={() => setRows((prev) => [...prev, newRow(prev[prev.length - 1])])}
                disabled={rows.length >= 50}
              >
                Thêm dòng
              </Button>
              <Button variant="gradient" onClick={submit} disabled={!ready || saving}>
                {saving ? "Đang giao..." : `Giao ${rows.length} bài`}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 px-4 py-3 font-semibold">
          Bài đã giao ({cls.assignments.length})
        </h3>
        {cls.assignments.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">Chưa giao bài nào.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {cls.assignments.map((a) => {
              const overdue = new Date(a.deadlineAt).getTime() < now;
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">{assignmentTitle(a)}</p>
                    <p className="text-xs text-slate-500">
                      {a.gameTypes.map((g) => GAME_LABELS[g] ?? g).join(", ")} · Giao lúc{" "}
                      {formatVnDateTime(a.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editing?.id === a.id ? (
                      <>
                        <input
                          type="datetime-local"
                          value={editing.value}
                          onChange={(e) => setEditing({ id: a.id, value: e.target.value })}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                        />
                        <Button
                          variant="primary"
                          disabled={!editing.value}
                          onClick={() =>
                            run(async () => {
                              await classService.updateDeadline(cls.id, a.id, vnLocalToIso(editing.value));
                              setEditing(null);
                            }, "Đã cập nhật hạn nộp")
                          }
                        >
                          Lưu
                        </Button>
                        <Button variant="ghost" onClick={() => setEditing(null)}>
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            overdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Hạn {formatVnDateTime(a.deadlineAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditing({ id: a.id, value: isoToVnLocal(a.deadlineAt) })}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0E4BA9]"
                          aria-label="Sửa hạn nộp"
                        >
                          <CalendarClock className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(a)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Xóa bài tập"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function AssignRowEditor({
  row,
  catalog,
  onChange,
  onRemove,
}: {
  row: AssignRow;
  catalog: Catalog;
  onChange: (patch: Partial<AssignRow>) => void;
  onRemove?: () => void;
}) {
  const book = catalog.books.find((b) => b.bookType === row.bookType);
  const unit = book?.units.find((u) => u.slug === row.unitSlug);
  const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm";

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid gap-2 md:grid-cols-[1fr_1.5fr_1.2fr_1fr_auto]">
        <select
          value={row.bookType}
          onChange={(e) => onChange({ bookType: e.target.value, unitSlug: "", partId: "" })}
          className={selectClass}
        >
          {catalog.books.map((b) => (
            <option key={b.bookType} value={b.bookType}>
              {b.bookName}
            </option>
          ))}
        </select>
        <select
          value={row.unitSlug}
          onChange={(e) => {
            const next = book?.units.find((u) => u.slug === e.target.value);
            onChange({
              unitSlug: e.target.value,
              partId: next?.parts.length === 1 ? next.parts[0].id : "",
            });
          }}
          className={selectClass}
        >
          <option value="">— Chọn unit —</option>
          {book?.units.map((u) => (
            <option key={u.slug} value={u.slug}>
              {u.name}
            </option>
          ))}
        </select>
        <select
          value={row.partId}
          onChange={(e) => onChange({ partId: e.target.value })}
          disabled={!unit}
          className={selectClass}
        >
          <option value="">— Chọn lesson —</option>
          {unit?.parts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={row.deadline}
          onChange={(e) => onChange({ deadline: e.target.value })}
          className={selectClass}
          title="Hạn nộp (giờ Việt Nam)"
        />
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Bỏ dòng"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <span className="hidden w-8 md:block" />
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {catalog.games.map((g) => (
          <label key={g} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={row.gameTypes.includes(g)}
              onChange={(e) =>
                onChange({
                  gameTypes: e.target.checked
                    ? catalog.games.filter((x) => x === g || row.gameTypes.includes(x))
                    : row.gameTypes.filter((x) => x !== g),
                })
              }
            />
            {GAME_LABELS[g] ?? g}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Tiến độ ---------------- */

function ProgressCellView({ cell }: { cell?: ProgressCell }) {
  if (!cell || cell.status === "pending") {
    return <span className="text-slate-400">Chưa làm</span>;
  }
  if (cell.status === "in_progress") {
    return (
      <span className="text-amber-700">
        Đang làm {cell.doneCount}/{cell.totalCount}
      </span>
    );
  }
  return (
    <div>
      <span className="font-semibold text-green-700">{cell.score10 ?? "—"} điểm</span>
      {cell.isLate && (
        <span className="ml-1 rounded bg-red-100 px-1 text-[10px] font-bold text-red-700">TRỄ</span>
      )}
      {cell.submittedAt && (
        <div className="text-[11px] text-slate-500">{formatVnDateTime(cell.submittedAt)}</div>
      )}
    </div>
  );
}

function ProgressTab({ classId, onError }: { classId: string; onError: (msg: string) => void }) {
  const [data, setData] = useState<ClassProgress | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    classService
      .progress(classId)
      .then(setData)
      .catch((err) => onError(getApiErrorMessage(err)));
  }, [classId, onError]);

  const summary = useMemo(() => {
    if (!data) return {};
    const result: Record<string, number> = {};
    for (const a of data.assignments) {
      result[a.id] = Object.values(data.cells[a.id] ?? {}).filter((c) => c.status === "done").length;
    }
    return result;
  }, [data]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await classService.exportCsv(classId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      onError(getApiErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  if (!data) return <p className="text-sm text-slate-500">Đang tải tiến độ...</p>;

  if (data.assignments.length === 0 || data.students.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        Cần có học viên và bài tập để xem tiến độ.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" leftIcon={<Download />} onClick={exportCsv} disabled={exporting}>
          Xuất CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2">Học viên</th>
              {data.assignments.map((a) => (
                <th key={a.id} className="min-w-[160px] px-3 py-2 align-top">
                  <div className="font-semibold text-slate-800">{a.title}</div>
                  <div className="font-normal text-slate-500">Hạn {formatVnDateTime(a.deadlineAt)}</div>
                  <div className="font-normal text-slate-500">
                    Hoàn thành {summary[a.id] ?? 0}/{data.students.length}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => (
              <tr key={s.userId} className="border-t border-slate-100">
                <td className="sticky left-0 z-10 bg-white px-3 py-2">
                  <div className="font-medium">{s.name}</div>
                  <div className="font-mono text-[11px] text-slate-500">{s.username}</div>
                </td>
                {data.assignments.map((a) => (
                  <td key={a.id} className="px-3 py-2">
                    <ProgressCellView cell={data.cells[a.id]?.[s.userId]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
