import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

type RetryConfig = InternalAxiosRequestConfig & {
  _retryCount?: number;
};

/** Render free tier cold-start thường 30–60s; timeout ngắn sẽ báo lỗi giả. */
const REQUEST_TIMEOUT_MS = 55_000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_500;

function isRetryableError(error: AxiosError) {
  if (error.code === "ECONNABORTED") return true;
  if (!error.response) return true; // network / DNS / connection reset

  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Client gọi API public (games, leaderboard, verify student) — không cần JWT */
const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: REQUEST_TIMEOUT_MS,
});

publicClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config || !isRetryableError(error)) {
      return Promise.reject(error);
    }

    const retryCount = config._retryCount ?? 0;
    if (retryCount >= MAX_RETRIES) {
      return Promise.reject(error);
    }

    config._retryCount = retryCount + 1;
    await delay(BASE_DELAY_MS * 2 ** retryCount);
    return publicClient.request(config);
  },
);

export default publicClient;
