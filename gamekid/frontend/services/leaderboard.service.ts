import publicClient from "@/lib/api/public-client";

export type LeaderboardRow = {
  studentId: string;
  playerId: string;
  name: string;
  bestScore: number;
};

export type MonthlyLeaderboardEntry = {
  rank: number;
  studentId: string;
  playerId: string;
  name: string;
  totalScore: number;
};

export type MonthlyLeaderboardResponse = {
  bookType: string;
  year: number;
  month: number;
  updatedAt: string;
  rows: MonthlyLeaderboardEntry[];
  me: MonthlyLeaderboardEntry | null;
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

  async getMonthlyTop(payload: {
    bookType: string;
    year: number;
    month: number;
    limit?: number;
    playerId?: string;
  }) {
    const { data } = await publicClient.get<MonthlyLeaderboardResponse>(
      "/leaderboard/monthly-top",
      { params: payload },
    );
    return data;
  },

  async submit(payload: {
    playerId: string;
    unitSlug: string;
    partId: string;
    gameType: string;
    score: number;
    bookType?: string;
  }) {
    const { data } = await publicClient.post<{ bestScore: number }>(
      "/leaderboard/submit",
      payload,
    );
    return data;
  },
};
