import type { User, LoginCredentials, AuthSession } from "@/types";

export const AUTH_EVENT = "unify:auth-changed";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL!
).replace(/\/$/, "");

const STORAGE_KEY = "unify_auth_user";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

let ongoingRefreshPromise: Promise<boolean> | null = null;
let lastKnownUser: User | null = null;

function notifyAuthChange(user: User | null) {
  lastKnownUser = user;
  setStoredUser(user);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { user } }));
  }
}

export const authClient = {
  getCachedUser(): User | null {
    if (lastKnownUser) return lastKnownUser;
    lastKnownUser = getStoredUser();
    return lastKnownUser;
  },

  async signIn(credentials: LoginCredentials): Promise<{ user: User }> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || "Login failed");
    }

    notifyAuthChange(data.user);
    return { user: data.user };
  },



  async signOut(): Promise<void> {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      notifyAuthChange(null);
    }
  },

  /**
   * Verification sequence:
   * 1. Check access token with GET /api/auth/me (validating lifetime & signature).
   * 2. If 401 (token expired/invalid), attempt refresh with POST /api/auth/refresh.
   * 3. If refresh succeeds, return new user.
   * 4. If refresh fails, clear session.
   */
  async getSession(): Promise<AuthSession> {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user || null;
        notifyAuthChange(user);
        return { user, isAuthenticated: Boolean(user) };
      }

      // Step 2: Access token expired or invalid, attempt refresh
      if (res.status === 401) {
        const refreshed = await this.refreshSession();
        if (refreshed && lastKnownUser) {
          return { user: lastKnownUser, isAuthenticated: true };
        }
      }

      notifyAuthChange(null);
      return { user: null, isAuthenticated: false };
    } catch {
      notifyAuthChange(null);
      return { user: null, isAuthenticated: false };
    }
  },

  async refreshSession(): Promise<boolean> {
    if (ongoingRefreshPromise) {
      return ongoingRefreshPromise;
    }

    ongoingRefreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          const user = data.user || null;
          notifyAuthChange(user);
          return true;
        }

        notifyAuthChange(null);
        return false;
      } catch {
        notifyAuthChange(null);
        return false;
      } finally {
        ongoingRefreshPromise = null;
      }
    })();

    return ongoingRefreshPromise;
  },



  /**
   * Authenticated HTTP request wrapper with automatic single-retry token refresh on 401.
   */
  async fetch(
    input: string | URL | Request,
    init?: RequestInit & { _isRetry?: boolean }
  ): Promise<Response> {
    const isRetry = Boolean(init?._isRetry);

    const res = await fetch(input, {
      ...init,
      credentials: "include",
    });

    const urlString =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

    const isAuthRoute =
      urlString.includes("/api/auth/login") ||
      urlString.includes("/api/auth/signup") ||
      urlString.includes("/api/auth/refresh");

    // If 401 on non-auth route and not already retried, refresh and retry once
    if (res.status === 401 && !isRetry && !isAuthRoute) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        return fetch(input, {
          ...init,
          credentials: "include",
          headers: init?.headers,
        });
      }
    }

    return res;
  },
};
