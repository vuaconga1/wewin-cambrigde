import publicClient from "@/lib/api/public-client";
import axiosClient from "@/lib/auth/axios";
import { UnitGameConfig } from "@/types/games";

export const gameService = {
  async getAllGames(bookType?: string) {
    const params = bookType ? { bookType } : {};
    try {
      const { data } = await publicClient.get("/games", { params });
      return data as UnitGameConfig[];
    } catch (error) {
      console.error("Error fetching games:", error);
      throw error;
    }
  },

  async getGamesByType(bookType: string) {
    try {
      const { data } = await publicClient.get(`/games/type/${bookType}`);
      return data as UnitGameConfig[];
    } catch (error) {
      console.error("Error fetching games by type:", error);
      throw error;
    }
  },

  async getGameBySlug(slug: string) {
    try {
      const { data } = await publicClient.get(`/games/${slug}`);
      return data as UnitGameConfig | null;
    } catch (error) {
      console.error("Error fetching game by slug:", error);
      throw error;
    }
  },

  async createGameUnit(data: Partial<UnitGameConfig>) {
    try {
      const response = await axiosClient.post("/games", data);
      return response.data as UnitGameConfig;
    } catch (error) {
      console.error("Error creating game unit:", error);
      throw error;
    }
  },

  async updateGameUnit(id: string, data: Partial<UnitGameConfig>) {
    try {
      const response = await axiosClient.put(`/games/${id}`, data);
      return response.data as UnitGameConfig;
    } catch (error) {
      console.error("Error updating game unit:", error);
      throw error;
    }
  },

  async deleteGameUnit(id: string) {
    try {
      const response = await axiosClient.delete(`/games/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting game unit:", error);
      throw error;
    }
  },
};
