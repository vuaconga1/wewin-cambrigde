import axiosClient from "@/lib/auth/axios";

export type VocabImageStatus = "none" | "pending" | "approved" | "rejected";

export type VocabImageListItem = {
  word: string;
  slug: string;
  imageUrl: string | null;
  status: VocabImageStatus;
  meaning?: string | null;
  rejectedCount: number;
};

export type GenerateMissingResult = {
  processed: number;
  limit?: number;
  results: Array<{ slug: string; ok: boolean; error?: string }>;
  hint?: string;
};

export const vocabImagesService = {
  list(params?: { status?: VocabImageStatus; search?: string }) {
    return axiosClient.get<VocabImageListItem[]>("/vocab-images", { params });
  },

  listPending() {
    return axiosClient.get<VocabImageListItem[]>("/vocab-images/pending");
  },

  generateMissing(limit = 5) {
    return axiosClient.post<GenerateMissingResult>(
      "/vocab-images/generate-missing",
      { limit },
      { timeout: 180000 },
    );
  },

  approve(word: string) {
    return axiosClient.post("/vocab-images/approve", { word });
  },

  reject(word: string) {
    return axiosClient.post("/vocab-images/reject", { word });
  },

  regenerate(word: string) {
    return axiosClient.post("/vocab-images/regenerate", { word }, { timeout: 180000 });
  },
};