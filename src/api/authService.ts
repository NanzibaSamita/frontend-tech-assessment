import { apiClient, publicClient } from "./httpClients";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id?: string | number;
  email: string;
  role?: string;
  name?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user?: AuthUser;
}

interface TokenResponse {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  token?: string;
  user?: AuthUser;
  data?: TokenResponse;
}

const LOGIN_PATH =
  import.meta.env.VITE_LOGIN_PATH || "/auth/login";

const REFRESH_PATH =
  import.meta.env.VITE_REFRESH_PATH || "/auth/refresh";

const ME_PATH =
  import.meta.env.VITE_ME_PATH || "/auth/me";

function getPayload(responseData: TokenResponse): TokenResponse {
  return responseData.data ?? responseData;
}

function getAccessToken(payload: TokenResponse): string {
  const accessToken =
    payload.accessToken ??
    payload.access_token ??
    payload.token;

  if (!accessToken) {
    throw new Error("Access token was not returned by the server.");
  }

  return accessToken;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await publicClient.post<TokenResponse>(
      LOGIN_PATH,
      credentials,
    );

    const payload = getPayload(response.data);

    const accessToken = getAccessToken(payload);

    const refreshToken =
      payload.refreshToken ??
      payload.refresh_token;

    if (!refreshToken) {
      throw new Error("Refresh token was not returned by the server.");
    }

    return {
      accessToken,
      refreshToken,
      user: payload.user,
    };
  },

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    const response = await publicClient.post<TokenResponse>(
      REFRESH_PATH,
      {
        refreshToken,
      },
    );

    const payload = getPayload(response.data);

    return {
      accessToken: getAccessToken(payload),
      refreshToken:
        payload.refreshToken ??
        payload.refresh_token,
    };
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<
      AuthUser | { user: AuthUser; data?: AuthUser }
    >(ME_PATH);

    if ("user" in response.data && response.data.user) {
      return response.data.user;
    }

    if ("data" in response.data && response.data.data) {
      return response.data.data;
    }

    return response.data as AuthUser;
  },
};