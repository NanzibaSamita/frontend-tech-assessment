import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { apiClient } from "./httpClients";
import { authService } from "./authService";
import { tokenStorage } from "../utils/tokenStorage";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryableRequestConfig
      | undefined;

    const status = error.response?.status;

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      tokenStorage.clearSession();
      window.dispatchEvent(
        new Event("auth:session-expired"),
      );

      return Promise.reject(error);
    }

    try {
      /*
       * If several requests fail with 401 simultaneously,
       * they will all wait for the same refresh request.
       */
      if (!refreshPromise) {
        refreshPromise = authService
          .refresh(refreshToken)
          .then((tokens) => {
            tokenStorage.updateTokens(
              tokens.accessToken,
              tokens.refreshToken,
            );

            return tokens.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clearSession();

      window.dispatchEvent(
        new Event("auth:session-expired"),
      );

      return Promise.reject(refreshError);
    }
  },
);