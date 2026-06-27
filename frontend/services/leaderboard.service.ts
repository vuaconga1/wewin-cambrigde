import publicClient from "@/lib/api/public-client";

export type LeaderboardRow = {
  studentId: string;
  playerId: string;
  name: string;
  bestScore: number;
};

export const leaderboardService = {
  async getTop(payload: {
    unitSlug: string;
    partId: string;
    gameType: string;
    limit?: number;
  }) {
    const { data } = await publicClient.get<LeaderboardRow[]>("/leaderboard/top", {
      params: payload,
    });
    return data;
  },

  async submit(payload: {
    playerId: string;
    unitSlug: string;
    partId: string;
    gameType: string;
    score: number;
  }) {
    const { data } = await publicClient.post<{ bestScore: number }>(
      "/leaderboard/submit",
      payload,
    );
    return data;
  },
};

