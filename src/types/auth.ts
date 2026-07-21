export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id?: string | number;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user?: AuthUser;
}
