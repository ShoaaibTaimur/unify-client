import type { AuthErrorKind, AuthEvent, AuthEventListener, AuthSession, LoginCredentials, Role, User } from "@/types";

export function getSafeRedirectUrl(target: string | null): string | null {
  if (!target) return null;
  if (target === "/login" || target.startsWith("/login?") || target === "/change-password") return null;
  return target.startsWith("/") && !target.startsWith("//") && !target.includes("\\")
    ? target
    : null;
}

export function isRoleAuthorized(role: Role, target: string): boolean {
  if (target.startsWith("/admin")) return role === "admin";
  if (target.startsWith("/teacher")) return role === "teacher";
  if (target.startsWith("/cr")) return role === "cr";
  return true;
}

export function getDashboardPath(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  if (role === "cr") return "/cr";
  return "/";
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 12_000;
const REFRESH_LOCK = "unify:refresh-session";
const REFRESH_LEASE_KEY = "unify_refresh_lease";
const REFRESH_LEASE_MS = 15_000;
const TAB_ID = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

const listeners = new Set<AuthEventListener>();
let channel: BroadcastChannel | null = null;
let ongoingRefreshPromise: Promise<User | null> | null = null;

export class AuthClientError extends Error {
  readonly kind: AuthErrorKind;

  constructor(message: string, kind: AuthErrorKind) {
    super(message);
    this.name = "AuthClientError";
    this.kind = kind;
  }
}

function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new AuthClientError("NEXT_PUBLIC_API_URL is not configured", "server");
  }
  return `${API_URL}${path}`;
}

function isRole(value: unknown): value is Role {
  return value === "student" || value === "cr" || value === "teacher" || value === "admin";
}

function parseUser(value: unknown): User {
  if (!value || typeof value !== "object") {
    throw new AuthClientError("Invalid authentication response", "server");
  }

  const user = value as Record<string, unknown>;
  if (
    typeof user.id !== "string" ||
    typeof user.name !== "string" ||
    typeof user.email !== "string" ||
    !isRole(user.role) ||
    typeof user.mustChangePassword !== "boolean"
  ) {
    throw new AuthClientError("Invalid authentication response", "server");
  }

  return value as User;
}

async function readError(response: Response, fallback: string): Promise<AuthClientError> {
  const body = await response.json().catch(() => null);
  const message = typeof body?.error === "string" ? body.error : fallback;
  return new AuthClientError(message, response.status < 500 ? "validation" : "server");
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const externalSignal = init?.signal;
  const abort = () => controller.abort();
  externalSignal?.addEventListener("abort", abort, { once: true });

  try {
    return await fetch(input, {
      ...init,
      credentials: "include",
      signal: controller.signal,
    });
  } catch {
    const message =
      controller.signal.aborted && !externalSignal?.aborted
        ? "Authentication request timed out"
        : "Unable to reach authentication server";
    throw new AuthClientError(message, "network");
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", abort);
  }
}

function emitLocal(event: AuthEvent) {
  for (const listener of listeners) listener(event);
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel("unify-auth");
    channel.onmessage = (message: MessageEvent<{ source?: string; event?: AuthEvent }>) => {
      if (message.data?.source === TAB_ID || !message.data?.event) return;
      emitLocal(message.data.event);
    };
  }
  return channel;
}

function broadcast(event: AuthEvent) {
  getChannel()?.postMessage({ source: TAB_ID, event });
}

async function getCurrentUserResponse(): Promise<Response> {
  return fetchWithTimeout(getApiUrl("/api/auth/me"), {
    method: "GET",
    cache: "no-store",
  });
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function withStorageRefreshLease(
  refresh: () => Promise<User | null>
): Promise<User | null> {
  if (typeof window === "undefined") return refresh();

  const deadline = Date.now() + REFRESH_LEASE_MS;
  while (Date.now() < deadline) {
    let lease: { owner?: string; expiresAt?: number } | null = null;
    try {
      lease = JSON.parse(localStorage.getItem(REFRESH_LEASE_KEY) ?? "null");
    } catch {
      lease = null;
    }

    if (!lease?.expiresAt || lease.expiresAt <= Date.now()) {
      const candidate = JSON.stringify({ owner: TAB_ID, expiresAt: Date.now() + REFRESH_LEASE_MS });
      localStorage.setItem(REFRESH_LEASE_KEY, candidate);
      await wait(25);

      if (localStorage.getItem(REFRESH_LEASE_KEY) === candidate) {
        try {
          return await refresh();
        } finally {
          if (localStorage.getItem(REFRESH_LEASE_KEY) === candidate) {
            localStorage.removeItem(REFRESH_LEASE_KEY);
          }
        }
      }
    }

    await wait(75 + Math.floor(Math.random() * 75));
  }

  throw new AuthClientError("Timed out waiting to refresh session", "network");
}

async function withRefreshLock(refresh: () => Promise<User | null>): Promise<User | null> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request(REFRESH_LOCK, refresh);
  }
  return withStorageRefreshLease(refresh);
}

async function refreshInsideLock(): Promise<User | null> {
  // Another tab may have refreshed while this tab waited for lock.
  const current = await getCurrentUserResponse();
  if (current.ok) {
    const data = await current.json();
    return parseUser(data?.user);
  }
  if (current.status !== 401) {
    throw await readError(current, "Unable to verify session");
  }

  const response = await fetchWithTimeout(getApiUrl("/api/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    const data = await response.json();
    const user = parseUser(data?.user);
    broadcast({ type: "session-changed" });
    return user;
  }

  if (response.status === 400 || response.status === 401) {
    emitLocal({ type: "signed-out" });
    broadcast({ type: "signed-out" });
    return null;
  }

  throw await readError(response, "Unable to refresh session");
}

async function refreshSession(): Promise<User | null> {
  if (ongoingRefreshPromise) return ongoingRefreshPromise;

  ongoingRefreshPromise = withRefreshLock(refreshInsideLock).finally(() => {
    ongoingRefreshPromise = null;
  });
  return ongoingRefreshPromise;
}

async function authenticatedFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const request = new Request(input, { ...init, credentials: "include" });
  const retryRequest = request.clone();
  const response = await fetchWithTimeout(request, { signal: request.signal });
  const requestUrl = new URL(request.url);
  const apiOrigin = API_URL ? new URL(API_URL).origin : "";
  const excludedAuthPaths = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/refresh",
    "/api/auth/logout",
  ];
  const canRefresh =
    requestUrl.origin === apiOrigin && !excludedAuthPaths.includes(requestUrl.pathname);

  if (response.status !== 401 || !canRefresh) return response;

  const user = await refreshSession();
  if (!user) return response;

  const retryResponse = await fetchWithTimeout(retryRequest, { signal: retryRequest.signal });
  if (retryResponse.status === 401) {
    emitLocal({ type: "signed-out" });
    broadcast({ type: "signed-out" });
  }
  return retryResponse;
}

export const authClient = {
  subscribe(listener: AuthEventListener): () => void {
    listeners.add(listener);
    getChannel();
    return () => listeners.delete(listener);
  },

  async signIn(credentials: LoginCredentials): Promise<{ user: User }> {
    const response = await fetchWithTimeout(getApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });

    if (!response.ok) throw await readError(response, "Login failed");

    const data = await response.json();
    const user = parseUser(data?.user);
    broadcast({ type: "session-changed" });
    return { user };
  },

  async signOut(): Promise<void> {
    const response = await fetchWithTimeout(getApiUrl("/api/auth/logout"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw await readError(response, "Logout failed");
    broadcast({ type: "signed-out" });
  },

  async changePassword(current: string, next: string): Promise<void> {
    const response = await authenticatedFetch(getApiUrl("/api/auth/change-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    if (!response.ok) throw await readError(response, "Password change failed");
    broadcast({ type: "signed-out" });
  },

  async getSession(): Promise<AuthSession> {
    const response = await getCurrentUserResponse();
    if (response.ok) {
      const data = await response.json();
      const user = parseUser(data?.user);
      return { user };
    }

    if (response.status !== 401) {
      throw await readError(response, "Unable to verify session");
    }

    const user = await refreshSession();
    return { user };
  },
  refreshSession,
  fetch: authenticatedFetch,
};
