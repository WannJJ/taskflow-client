import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Quan trọng: tránh flash redirect khi rehydrate từ localStorage

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * GIẢI THÍCH KIẾN TRÚC:
 *
 * 1. Access Token: Lưu trong Zustand store (memory). Vì dùng persist middleware
 *    nên nó cũng được lưu xuống localStorage. Đây là trade-off cho sự đơn giản.
 *    Trong production thực tế, nên dùng httpOnly cookie cho refresh token.
 *
 * 2. Refresh Token: Cũng persist, dùng để gọi /auth/refresh khi access token hết hạn.
 *
 * 3. isLoading: Rất quan trọng! Khi app vừa load, Zustan đang đọc dữ liệu từ
 *    localStorage ("rehydrate"). Trong lúc này, chúng ta KHÔNG biết user
 *    đã login hay chưa. Nếu render luôn → có thể flash dashboard rồi redirect login.
 *    isLoading giúp chờ rehydrate xong mới kiểm tra auth.
 *
 * 4. onRehydrateStorage: Callback chạy sau khi đọc xong từ localStorage.
 *    Dùng để tắt isLoading.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "taskflow-auth", // Tên key trong localStorage
      // Chỉ persist những field cần thiết (không persist isLoading)
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Sau khi rehydrate từ localStorage, tắt loading
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false);
        }
      },
    },
  ),
);
