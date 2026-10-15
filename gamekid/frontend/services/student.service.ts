import axiosClient from "@/lib/auth/axios";
import publicClient from "@/lib/api/public-client";
import type { StudentSession } from "@/stores/student.store";

export const studentService = {
  async verifyPlayerId(playerId: string): Promise<StudentSession> {
    const { data } = await publicClient.post<StudentSession>(
      "/students/verify",
      { playerId },
    );
    return data;
  },

  /**
   * SSO nhẹ từ web báo bài: tìm học sinh theo Mã HV, nếu chưa có thì tạo mới.
   * Dùng khi học sinh mở khu trò chơi được nhúng trong web báo bài.
   */
  async ensurePlayerId(
    playerId: string,
    name?: string,
  ): Promise<StudentSession> {
    const { data } = await publicClient.post<StudentSession>(
      "/students/ensure",
      { playerId, name },
    );
    return data;
  },

  async getAll() {
    const { data } = await axiosClient.get<StudentSession[]>("/students");
    return data;
  },

  async create(payload: { playerId: string; name: string }) {
    const { data } = await axiosClient.post<StudentSession>(
      "/students",
      payload,
    );
    return data;
  },

  async update(
    id: string,
    payload: { playerId?: string; name?: string },
  ) {
    const { data } = await axiosClient.put<StudentSession>(
      `/students/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await axiosClient.delete<{ message: string }>(
      `/students/${id}`,
    );
    return data;
  },
};
