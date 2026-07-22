import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      displayName: string | null;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<AuthResponse>("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      router.push("/dashboard");
    },
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      router.push("/dashboard");
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      return response.data.data;
    },
    enabled: false, // Không tự động fetch, chỉ fetch khi cần
  });
}
