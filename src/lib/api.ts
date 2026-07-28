import { useAuthStore } from "@/stores/auth-store";
import axios from "axios";

/**
 * Axios instance đã cấu hình sẵn baseURL và headers
 * Dùng cho mọi API call trong ứng dụng
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 giây timeout
});

/**
 * Request Interceptor: Tự động gắn Access Token vào header
 */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor: Xử lý lỗi 401 (Unauthorized)
 * TODO: Sau này thêm logic refresh token ở đây
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
