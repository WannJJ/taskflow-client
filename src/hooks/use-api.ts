"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * useApi - Custom Hook quản lý API call
 *
 * Cần hook thay vì dùng try-catch thuần, vì
 * 1. Đồng nhất: Mọi API call đều có cùng pattern loading/error/data
 * 2. DRY: Không lặp lại code try-catch ở mọi component
 * 3. Toast tự động: Lỗi tự động hiển thị toast, không cần xử lý ở component
 * 4. Type-safe: Generic T để type inference
 *
 * Cách dùng:
 * const { data, loading, error, execute } = useApi<Task[]>();
 * execute(() => api.get('/tasks'));
 */
interface UseApiOptions<T> {
  successMessage?: string;
  errorMessage?: string | false;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (
    apiCall: () => Promise<any>,
    options?: UseApiOptions<T>,
  ) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<any>,
      options: UseApiOptions<T> = {},
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();
        const result = response.data?.data || response.data;
        setData(result);

        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        options.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const message =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Đã có lỗi xảy ra";

        setError(message);

        if (options.errorMessage !== false) {
          toast.error(options.errorMessage || message);
        }

        options.onError?.(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

export function useMutation<T = any>() {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (
      apiCall: () => Promise<any>,
      options: UseApiOptions<T> = {},
    ): Promise<T | null> => {
      setLoading(true);
      try {
        const response = await apiCall();
        const result = response.data?.data || response.data;

        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        options.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const message =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Đã có lỗi xảy ra";

        if (options.errorMessage !== false) {
          toast.error(options.errorMessage || message);
        }
        options.onError?.(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { mutate, loading };
}
