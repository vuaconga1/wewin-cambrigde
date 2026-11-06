import axiosClient from "@/lib/auth/axios";
import publicClient from "@/lib/api/public-client";

export type HomeworkItem = {
  assignmentId: string;
  className: string;
  title: string;
  bookType: string;
  unitSlug: string;
  partId: string;
  gameTypes: string[];
  doneCount: number;
  totalCount: number;
  deadlineAt: string;
  deadlineDisplay: string;
  isOverdue: boolean;
  isNew: boolean;
};

export type IncompleteHomeworkResponse = {
  success: boolean;
  count: number;
  overdueCount: number;
  upcomingCount: number;
  items: HomeworkItem[];
  displayName?: string | null;
};

export const homeworkService = {
  async incompleteForMe() {
    const { data } = await axiosClient.get<IncompleteHomeworkResponse>(
      "/homework/incomplete",
    );
    return data;
  },

  async incompleteByPlayer(playerId: string) {
    const { data } = await publicClient.get<IncompleteHomeworkResponse>(
      "/homework/incomplete/by-player",
      { params: { playerId } },
    );
    return data;
  },
};
