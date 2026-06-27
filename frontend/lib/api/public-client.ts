import axios from "axios";

/** Client gọi API public (games, leaderboard, verify student) — không cần JWT */
const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 15000,
});

export default publicClient;
