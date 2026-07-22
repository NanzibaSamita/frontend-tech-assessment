import axios from "axios";

interface ApiErrorBody {
  message?: string;
  error?: string;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? error.response?.data?.error ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}
