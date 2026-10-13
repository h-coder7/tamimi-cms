"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, { getApiErrorMessage } from "@/app/api/api";
import { clearCsrfToken, setCsrfToken } from "@/lib/csrf";

const AuthContext = createContext(null);

function toUiUser(me) {
  if (!me) return null;
  return {
    id: me.id,
    name: me.fullName,
    email: me.email,
    status: me.status,
    roles: me.roles || [],
    permissions: me.permissions || [],
    csrfToken: me.csrfToken,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyMe = useCallback((me) => {
    const ui = toUiUser(me);
    setUser(ui);
    if (me?.csrfToken) setCsrfToken(me.csrfToken);
    if (ui) {
      localStorage.setItem(
        "user",
        JSON.stringify({ name: ui.name, email: ui.email })
      );
    } else {
      localStorage.removeItem("user");
    }
    return ui;
  }, []);

  const refreshMe = useCallback(async () => {
    const res = await api.get("/auth/me");
    return applyMe(res.data?.data);
  }, [applyMe]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshMe();
      } catch {
        if (!cancelled) {
          clearCsrfToken();
          setUser(null);
          localStorage.removeItem("user");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshMe]);

  const login = useCallback(
    async (email, password) => {
      try {
        const res = await api.post("/auth/login", { email, password });
        return applyMe(res.data?.data);
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Login failed"));
      }
    },
    [applyMe]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      clearCsrfToken();
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshMe,
    }),
    [user, loading, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
