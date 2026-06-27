"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImageIcon, RefreshCw, Search, Sparkles, XCircle } from "lucide-react";
import { vocabImagesService, type VocabImageListItem, type VocabImageStatus } from "@/services/vocab-images.service";
import Button from "@/app/components/button";
import { BackButton } from "@/app/components/backButton";
import { Routes } from "@/lib/constants/routes";

type NoticeState = { type: "success" | "error"; text: string } | null;
const STATUS_OPTIONS: Array<{ value: VocabImageStatus | "all"; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "none", label: "Missing image" },
  { value: "all", label: "All" },
];

function getErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) return "Khong the thuc hien thao tac.";
  const response = error as { response?: { data?: { message?: string } | string } };
  const message = response.response?.data;
  if (typeof message === "string") return message;
  if (message && typeof message === "object" && "message" in message) return message.message ?? "Loi.";
  return "Loi.";
}

export function VocabImagesReviewClient() {
  const router = useRouter();
  const [items, setItems] = useState<VocabImageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyWord, setBusyWord] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VocabImageStatus | "all">("pending");

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter === "all" ? (search.trim() ? { search: search.trim() } : undefined) : { status: statusFilter, ...(search.trim() ? { search: search.trim() } : {}) };
      const response = await vocabImagesService.list(params);
      setItems(Array.isArray(response.data) ? response.data : []);
      setNotice(null);
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { void loadItems(); }, [loadItems]);

  const handleGenerateMissing = async () => {
    setGenerating(true);
    setNotice({ type: "success", text: "Dang tao toi da 5 anh, co the mat 1-3 phut..." });
    try {
      const response = await vocabImagesService.generateMissing(5);
      const ok = response.data.results.filter((r) => r.ok).length;
      const failed = response.data.results.filter((r) => !r.ok).length;
      if (response.data.processed === 0) {
        setNotice({
          type: "error",
          text: response.data.hint ?? "Khong co tu nao can tao anh. Chay seed:vocab-images hoac chon filter Missing image.",
        });
        return;
      }
      const firstError = response.data.results.find((r) => !r.ok)?.error;
      setNotice({
        type: failed > 0 ? "error" : "success",
        text: `Da xu ly ${response.data.processed} tu. OK: ${ok}, loi: ${failed}.${firstError ? ` (${firstError})` : ""} Bam lai neu con tu thieu.`,
      });
      setStatusFilter("pending");
      await loadItems();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setGenerating(false);
    }
  };

  const runWordAction = async (word: string, action: "approve" | "reject" | "regenerate") => {
    setBusyWord(word);
    try {
      if (action === "approve") await vocabImagesService.approve(word);
      if (action === "reject") await vocabImagesService.reject(word);
      if (action === "regenerate") await vocabImagesService.regenerate(word);
      setNotice({ type: "success", text: `Updated "${word}".` });
      await loadItems();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setBusyWord(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <BackButton label="Quay lai" onClick={() => router.push(Routes.HOME)} />
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0E4BA9] text-white"><ImageIcon className="h-6 w-6" /></div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Vocabulary Image Review</h1>
                <p className="text-sm text-slate-500">Duyet anh pending truoc khi game su dung.</p>
              </div>
            </div>
          </div>
          <Button onClick={() => void handleGenerateMissing()} disabled={generating} className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />{generating ? "Generating..." : "Generate missing"}
          </Button>
        </div>
        {notice ? <div className={`rounded-2xl border px-4 py-3 text-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{notice.text}</div> : null}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tim tu vung..." className="w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none ring-[#0E4BA9] focus:ring-2" />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button key={option.value} type="button" onClick={() => setStatusFilter(option.value)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === option.value ? "bg-[#0E4BA9] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{option.label}</button>
            ))}
          </div>
        </div>
        {loading ? <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading...</div> : items.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No items.</div> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const isBusy = busyWord === item.word;
              return (
                <article key={item.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex aspect-square items-center justify-center bg-slate-50 p-4">
                    {item.imageUrl ? <Image src={item.imageUrl} alt={item.word} width={240} height={240} className="max-h-full max-w-full object-contain" unoptimized /> : <div className="text-center text-slate-400"><ImageIcon className="mx-auto mb-2 h-10 w-10" /><p className="text-sm">Chua co anh</p></div>}
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{item.word}</p>
                      {item.meaning ? <p className="text-sm text-slate-500">{item.meaning}</p> : null}
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{item.status}</p>
                    </div>
                    {item.status === "pending" ? (
                      <div className="grid grid-cols-3 gap-2">
                        <button type="button" disabled={isBusy} onClick={() => void runWordAction(item.word, "approve")} className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-2 text-xs font-semibold text-white disabled:opacity-60"><CheckCircle2 className="h-3.5 w-3.5" />Approve</button>
                        <button type="button" disabled={isBusy} onClick={() => void runWordAction(item.word, "reject")} className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-600 px-2 py-2 text-xs font-semibold text-white disabled:opacity-60"><XCircle className="h-3.5 w-3.5" />Reject</button>
                        <button type="button" disabled={isBusy} onClick={() => void runWordAction(item.word, "regenerate")} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800 px-2 py-2 text-xs font-semibold text-white disabled:opacity-60"><RefreshCw className="h-3.5 w-3.5" />Retry</button>
                      </div>
                    ) : item.status === "rejected" || item.status === "none" ? (
                      <button type="button" disabled={isBusy || generating} onClick={() => void runWordAction(item.word, "regenerate")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E4BA9] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><RefreshCw className="h-4 w-4" />Regenerate</button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}