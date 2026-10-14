"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@/types";
import { authClient, AUTH_EVENT, type SignUpInput } from "./client";
import { useSession } from "@/hooks/use-session";
import { api, type CreateUserInput } from "../api";

export type { CreateUserInput } from "../api";
export { authClient, AUTH_EVENT, type SignUpInput } from "./client";
export { useSession } from "@/hooks/use-session";

// In-memory cache for synchronous user access within client lifecycle
let inMemoryUser: User | null = null;

if (typeof window !== "undefined") {
  // Sync initial session on bootstrap
  authClient.getSession().then((session) => {
    inMemoryUser = session.user;
  });
}

export const customAuth = {
  /**
   * Browser JavaScript NEVER accesses tokens. Returns null by security design.
   */
  getToken(): string | null {
    return null;
  },

  /**
   * Returns in-memory cached user info without reading sensitive storage.
   */
  getUser(): User | null {
    return inMemoryUser;
  },

  async login(email: string, password: string): Promise<User> {
    const result = await authClient.signIn({ email: email.trim(), password });
    inMemoryUser = result.user;
    return result.user;
  },

  async logout(): Promise<void> {
    inMemoryUser = null;
    await authClient.signOut();
  },

  async createUser(input: CreateUserInput): Promise<User> {
    return api.createUser(input);
  },

  updateUser(patch: Partial<User>) {
    if (!inMemoryUser) return;
    inMemoryUser = { ...inMemoryUser, ...patch };
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_EVENT));
    }
  },

  isAuthenticated(): boolean {
    return Boolean(inMemoryUser);
  },
};

/**
 * Reactive React hook for custom frontend authentication.
 * Wraps useSession for backwards compatibility.
 */
export function useAuth(initialUser?: User | null) {
  const { user, isPending, isAuthenticated, refetch } = useSession(initialUser);

  useEffect(() => {
    if (user !== undefined) {
      inMemoryUser = user;
    }
  }, [user]);

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
    token: null, // Tokens are strictly HTTP-only and hidden from JS
    isAuthenticated,
    loaded: !isPending,
    login,
    logout,
    createUser,
    refetch,
  };
}
