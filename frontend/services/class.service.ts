import axiosClient from "@/lib/auth/axios";

export type ClassSummary = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  source: "manual" | "drive";
  isActive: boolean;
  memberCount: number;
  assignmentCount: number;
};

export type ClassMember = {
  userId: string;
  username: string;
  name: string;
  isActive: boolean;
  addedAt: string;
};

export type ClassAssignment = {
  id: string;
  classId: string;
  bookType: string;
  unitSlug: string;
  partId: string;
  gameTypes: string[];
  bookName: string;
  unitName: string;
  partTitle: string | null;
  deadlineAt: string;
  createdAt: string;
};

export type ClassDetail = Omit<ClassSummary, "memberCount" | "assignmentCount"> & {
  members: ClassMember[];
  assignments: ClassAssignment[];
};

export type StudentOption = { id: string; username: string; name: string };

export type CatalogBook = {
  bookType: string;
  bookName: string;
  units: {
    slug: string;
    name: string;
    unit: string;
    parts: { id: string; title: string }[];
  }[];
};

export type Catalog = { games: string[]; books: CatalogBook[] };

export type HomeworkStatus = "pending" | "in_progress" | "done";

export type ProgressCell = {
  status: HomeworkStatus;
  doneCount: number;
  totalCount: number;
  score10: number | null;
  attemptCount: number;
  submittedAt: string | null;
  isLate: boolean;
};

export type ClassProgress = {
  classId: string;
  assignments: {
    id: string;
    title: string;
    gameTypes: string[];
    deadlineAt: string;
    createdAt: string;
  }[];
  students: { userId: string; username: string; name: string }[];
  cells: Record<string, Record<string, ProgressCell>>;
};

export type NewAssignment = {
  unitSlug: string;
  partId: string;
  gameTypes?: string[];
  deadlineAt: string;
};

export const classService = {
  async list(params: { q?: string; page?: number; limit?: number }) {
    const { data } = await axiosClient.get<{
      items: ClassSummary[];
      total: number;
      page: number;
      limit: number;
    }>("/classes", { params });
    return data;
  },

  async create(payload: { name: string; code?: string; description?: string }) {
    const { data } = await axiosClient.post<ClassSummary>("/classes", payload);
    return data;
  },

  async update(
    id: string,
    payload: { name?: string; description?: string; isActive?: boolean },
  ) {
    const { data } = await axiosClient.patch<ClassSummary>(`/classes/${id}`, payload);
    return data;
  },

  async remove(id: string) {
    await axiosClient.delete(`/classes/${id}`);
  },

  async detail(id: string) {
    const { data } = await axiosClient.get<ClassDetail>(`/classes/${id}`);
    return data;
  },

  async searchStudents(q: string, excludeClassId?: string) {
    const { data } = await axiosClient.get<StudentOption[]>("/classes/students", {
      params: { q: q || undefined, excludeClassId },
    });
    return data;
  },

  async addMembers(id: string, userIds: string[]) {
    const { data } = await axiosClient.post<{ added: number }>(
      `/classes/${id}/members`,
      { userIds },
    );
    return data;
  },

  async removeMember(id: string, userId: string) {
    await axiosClient.delete(`/classes/${id}/members/${userId}`);
  },

  async catalog() {
    const { data } = await axiosClient.get<Catalog>("/classes/catalog");
    return data;
  },

  async createAssignments(id: string, items: NewAssignment[]) {
    const { data } = await axiosClient.post<ClassAssignment[]>(
      `/classes/${id}/assignments`,
      { items },
    );
    return data;
  },

  async updateDeadline(id: string, assignmentId: string, deadlineAt: string) {
    const { data } = await axiosClient.patch<ClassAssignment>(
      `/classes/${id}/assignments/${assignmentId}`,
      { deadlineAt },
    );
    return data;
  },

  async removeAssignment(id: string, assignmentId: string) {
    await axiosClient.delete(`/classes/${id}/assignments/${assignmentId}`);
  },

  async progress(id: string) {
    const { data } = await axiosClient.get<ClassProgress>(`/classes/${id}/progress`);
    return data;
  },

  async exportCsv(id: string) {
    const res = await axiosClient.get<Blob>(`/classes/${id}/export`, {
      responseType: "blob",
    });
    const disposition = String(res.headers["content-disposition"] ?? "");
    const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? "tien-do.csv";
    return { blob: res.data, filename };
  },
};

export function getApiErrorMessage(error: unknown) {
  const data = (error as { response?: { data?: { message?: unknown } | string } })
    ?.response?.data;
  if (typeof data === "string") return data;
  const message = data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  return "Không thể thực hiện thao tác.";
}

/** "datetime-local" (giờ VN) -> ISO có offset +07:00 */
export function vnLocalToIso(value: string) {
  return `${value.length === 16 ? `${value}:00` : value}+07:00`;
}

/** ISO -> giá trị cho input "datetime-local" theo giờ VN */
export function isoToVnLocal(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function formatVnDateTime(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}
