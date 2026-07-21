import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { authService } from "../api/authService";
import type { AuthUser, LoginCredentials } from "../types/auth";
import { tokenStorage } from "../utils/tokenStorage";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(tokenStorage.getAccessToken()),
  );

  const [user, setUser] = useState<AuthUser | null>(() =>
    tokenStorage.getUser(),
  );

  const logout = useCallback(() => {
    tokenStorage.clearSession();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await authService.login(credentials);

    const authenticatedUser: AuthUser = session.user ?? {
      email: credentials.email,
      role: "admin",
    };

    tokenStorage.saveSession({
      ...session,
      user: authenticatedUser,
    });

    setIsAuthenticated(true);
    setUser(authenticatedUser);
  }, []);

  useEffect(() => {
    window.addEventListener("auth:session-expired", logout);

    return () => {
      window.removeEventListener("auth:session-expired", logout);
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
    }),
    [isAuthenticated, user, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}