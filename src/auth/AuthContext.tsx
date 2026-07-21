import { createContext } from "react";
import type { AuthUser, LoginCredentials } from "../types/auth";

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);