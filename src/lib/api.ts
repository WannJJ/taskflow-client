import { useAuthStore } from "@/stores/auth-store";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * 🧠 GIẢI THÍCH ARCHITECTURE:
 *
 * Chúng ta tạo 2 instance axios riêng biệt:
 *
 * 1. `api`: Instance thường - có interceptor tự động refresh token
 *    Dùng cho 99% các API call trong app.
 *
 * 2. `apiPublic`: Instance "sạch" - KHÔNG có interceptor refresh
 *    Chỉ dùng cho /auth/refresh để tránh infinite loop
 *    (vì nếu refresh bị 401 thì không thể gọi refresh lại được).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// ============================================
// 1. PUBLIC API (không cần token, không auto-refresh)
// ============================================
export const apiPublic = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ============================================
// 2. PRIVATE API (có token + auto-refresh)
// ============================================
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ============================================
// REQUEST INTERCEPTOR: Tự động gắn Access Token
// ============================================
// Trước mỗi request, lấy accessToken từ Zustand store gắn vào header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================
// RESPONSE INTERCEPTOR: Xử lý 401 + Refresh Token
// ============================================

/**
 * 🚨 VẤN ĐỀ CẦN GIẢI QUYẾT:
 * Khi access token hết hạn, NHIỀU request có thể bị 401 CÙNG LÚC.
 * Nếu mỗi request đều gọi refresh → tạo ra N refresh token mới → lãng phí + race condition.
 *
 * 💡 GIẢI PHÁP: Dùng flag `isRefreshing` + queue `refreshSubscribers`
 * - Request đầu tiên bị 401 sẽ gọi refresh
 * - Các request khác bị 401 trong lúc đó sẽ được đưa vào hàng đợi
 * - Khi refresh xong, retry tất cả request trong hàng đợi cùng lúc
 */

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Hàm thêm request vào hàng đợi
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Hàm retry tất cả request trong hàng đợi
function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  // Response thành công → trả về luôn
  (response) => response,

  // Response lỗi
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu không phải lỗi 401, hoặc request đã retry rồi → reject luôn
    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Đánh dấu request này đã retry để tránh loop vô hạn
    originalRequest._retry = true;

    const refreshToken = useAuthStore.getState().refreshToken;

    // Không có refresh token → logout
    if (!refreshToken) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // ========================================
    // TRƯỜNG HỢP 1: Đang có request refresh chạy
    // → Đưa request hiện tại vào hàng đợi
    // ========================================
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    // ========================================
    // TRƯỜNG HỢP 2: Chưa có request refresh nào
    // → Gọi refresh
    // ========================================
    isRefreshing = true;

    try {
      const response = await apiPublic.post("/auth/refresh", {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Cập nhật token mới vào store
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);

      // Thông báo cho tất cả request trong hàng đợi
      onTokenRefreshed(accessToken);

      // Retry request gốc với token mới
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh token cũng hết hạn hoặc i  nvalid → logout
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
