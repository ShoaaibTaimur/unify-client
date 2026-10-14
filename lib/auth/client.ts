import type { User, LoginCredentials } from "@/types";

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role?: "student" | "cr" | "teacher";
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
}

export const AUTH_EVENT = "unify:auth-changed";
let ongoingRefreshPromise: Promise<boolean> | null = null;

export const authClient = {
  async signIn(credentials: LoginCredentials): Promise<{ user: User }> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "same-origin",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || "Login failed");
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_EVENT));
    }

    return { user: data.user };
  },

  /**
   * Register a new account via Next.js Route Handler.
   */
  async signUp(input: SignUpInput): Promise<{ user: User }> {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "same-origin",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || "Registration failed");
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_EVENT));
    }

    return { user: data.user };
  },

  /**
   * Log out current user, revoking server session and clearing cookies.
   */
  async signOut(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_EVENT));
      }
    }
  },

  /**
   * Query the authoritative current session from Next.js server.
   */
  async getSession(): Promise<AuthSession> {
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!res.ok) {
        return { user: null, isAuthenticated: false };
      }

      const data = await res.json();
      return {
        user: data.user || null,
        isAuthenticated: Boolean(data.isAuthenticated && data.user),
      };
    } catch {
      // Network failure: do not force unauthenticated state
      return { user: null, isAuthenticated: false };
    }
  },

  /**
   * Rotate and refresh access token with single-flight concurrency.
   */
  async refreshSession(): Promise<boolean> {
    if (ongoingRefreshPromise) {
      return ongoingRefreshPromise;
    }

    ongoingRefreshPromise = (async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
        });

        if (res.ok) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event(AUTH_EVENT));
          }
          return true;
        }

        if (res.status === 401 || res.status === 403) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event(AUTH_EVENT));
          }
          return false;
        }

        // 5xx / temporary error
        return false;
      } catch {
        return false;
      } finally {
        ongoingRefreshPromise = null;
      }
    })();

    return ongoingRefreshPromise;
  },

  /**
   * Authenticated HTTP request wrapper with automatic single-retry token refresh.
   */
  async fetch(input: string | URL | Request, init?: RequestInit & { _isRetry?: boolean }): Promise<Response> {
    const isRetry = Boolean(init?._isRetry);

    const res = await fetch(input, {
      ...init,
      credentials: "same-origin",
    });

    const urlString = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const isAuthRoute = urlString.includes("/api/auth/");

    // If 401 on non-auth route and not already retried, attempt refresh and retry once
    if (res.status === 401 && !isRetry && !isAuthRoute) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        return fetch(input, {
          ...init,
          credentials: "same-origin",
        });
      }
    }

    return res;
  },
};
