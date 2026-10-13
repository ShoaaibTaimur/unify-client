"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@/types";
import { api, type Role } from "./api";

const TOKEN_KEY = "unify_token";
const USER_KEY = "unify_user";
const AUTH_EVENT = "unify:auth-changed";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
}

export const customAuth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return JSON.parse(raw) as User;
      const match = document.cookie.match(/(?:^|;\s*)unify_user=([^;]+)/);
      if (match) {
        const parsed = JSON.parse(decodeURIComponent(match[1])) as User;
        localStorage.setItem(USER_KEY, JSON.stringify(parsed));
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<User> {
    const res = await api.login(email.trim(), password);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    if (typeof document !== "undefined") {
      document.cookie = `${TOKEN_KEY}=${encodeURIComponent(res.token)}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `${USER_KEY}=${encodeURIComponent(JSON.stringify(res.user))}; path=/; max-age=604800; SameSite=Lax`;
    }
    window.dispatchEvent(new Event(AUTH_EVENT));
    return res.user;
  },

  async logout(): Promise<void> {
    try {
      await api.logout();
    } catch {
      // Allow clean client teardown even if backend is offline
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (typeof document !== "undefined") {
      document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${USER_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
    window.dispatchEvent(new Event(AUTH_EVENT));
  },

  async createUser(input: CreateUserInput): Promise<User> {
    return api.createUser(input);
  },

  updateUser(patch: Partial<User>) {
    const current = this.getUser();
    if (!current) return;
    const updated = { ...current, ...patch };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    if (typeof document !== "undefined") {
      document.cookie = `${USER_KEY}=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=604800; SameSite=Lax`;
    }
    window.dispatchEvent(new Event(AUTH_EVENT));
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken() && this.getUser());
  },
};

/**
 * Reactive React hook for custom frontend authentication.
 */
export function useAuth(initialUser?: User | null) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [loaded, setLoaded] = useState(Boolean(initialUser));

  useEffect(() => {
    setUser(customAuth.getUser());
    setLoaded(true);
    const sync = () => setUser(customAuth.getUser());
    window.addEventListener(AUTH_EVENT, sync);
    return () => window.removeEventListener(AUTH_EVENT, sync);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return customAuth.login(email, password);
  }, []);

  const logout = useCallback(async () => {
    return customAuth.logout();
  }, []);

  const createUser = useCallback(async (input: CreateUserInput) => {
    return customAuth.createUser(input);
  }, []);

  return {
    user,
    token: typeof window !== "undefined" ? customAuth.getToken() : null,
    isAuthenticated: Boolean(user),
    loaded,
    login,
    logout,
    createUser,
  };
}
