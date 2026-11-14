/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/gtag.ts
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-BHPHF3EMKF";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

// 1. Chuyển đổi Lead (Đăng ký form, liên hệ, tư vấn)
export function trackLeadGeneration(data?: { formName?: string; [key: string]: any }) {
  trackEvent("generate_lead", {
    form_name: data?.formName || "Tu_Van",
    page_location: typeof window !== "undefined" ? window.location.href : "",
    ...data,
  });
}

// 2. Tương tác nghiệp vụ chính (VD: Bắt đầu làm bài thi/quiz/game)
export function trackQuizStart(data: { quizId: string | number; quizTitle?: string; [key: string]: any }) {
  trackEvent("quiz_start", data);
}

// 3. Hoàn thành nghiệp vụ (VD: Nộp bài thi, xem kết quả)
export function trackQuizComplete(data: { quizId: string | number; score?: number; [key: string]: any }) {
  trackEvent("quiz_complete", data);
}

// 4. Bấm chuyển hướng sang website chính (Outbound link)
export function trackOutboundToMainSite(destinationUrl = "https://wewin.edu.vn") {
  trackEvent("click_to_main_site", {
    destination_url: destinationUrl,
    source_page: typeof window !== "undefined" ? window.location.pathname : "",
  });
}
