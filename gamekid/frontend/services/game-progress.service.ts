import publicClient from "@/lib/api/public-client";

export type SavedGameProgress = {
  id: string;
  playerId: string;
  unitSlug: string;
  partId: string;
  bookname: string;
  progress: Record<string, boolean>;
  scores?: Record<string, number>;
  updatedAt?: string;
};

export const gameProgressService: {
  get(payload: { playerId: string; unitSlug: string; partId?: string }): Promise<SavedGameProgress | null>;
  save(payload: { playerId: string; unitSlug: string; partId?: string; bookname: string; progress: Record<string, boolean> }): Promise<SavedGameProgress>;
  clear(payload: { playerId: string; unitSlug: string; partId?: string }): Promise<void>;
} = {
  async get(payload: {
    playerId: string;
    unitSlug: string;
    partId?: string;
  }) {
    const { data } = await publicClient.get<SavedGameProgress | null>(
      "/game-progress",
      {
        params: payload,
      },
    );
    return data;
  },

  async save(payload: {
    playerId: string;
    unitSlug: string;
    partId?: string;
    bookname: string;
    progress: Record<string, boolean>;
  }) {
    const { data } = await publicClient.post<SavedGameProgress>(
      "/game-progress/save",
      payload,
    );
    return data;
  },

  async clear(payload: {
    playerId: string;
    unitSlug: string;
    partId?: string;
  }) {
    await publicClient.delete("/game-progress", {
      params: payload,
    });
  },
};