/**
 * UNIFY API client.
 *
 * All data is loaded from the real backend. Set the backend URL via env:
 *
 *     NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
 *
 * Without this variable, every request throws a clear error so nothing
 * silently falls back to fake data.
 */
import type { Activity, Batch, Department, Section, User } from "@/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export const isApiConfigured = Boolean(API_URL);

function requireApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "Backend not configured. Set NEXT_PUBLIC_API_URL to your deployed API URL (e.g. https://your-backend.vercel.app)."
    );
  }
  return API_URL;
}

function getTargetUrl(path: string): string {
  if (typeof window !== "undefined") {
    // In browser: relative URL leverages same-origin Next.js rewrite (zero CORS, auto cookies)
    return path;
  }
  return `${API_URL}${path}`;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("unify_token") : null;

  // Abort after 10 seconds to prevent lingering loading hangs
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(getTargetUrl(path), {
      cache: "no-store",
      credentials: "include",
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error("Request timed out. Check your network or server.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    let msg = `API ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error)
        msg =
          typeof body.error === "string"
            ? body.error
            : JSON.stringify(body.error);
    } catch {
      try {
        msg = (await res.text()) || msg;
      } catch {
        /* ignore */
      }
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type Role = "student" | "cr" | "teacher" | "admin";

export const api = {
  /* -------- Bootstrap / Aggregated -------- */
  getBootstrap: (filter?: {
    departmentId?: string;
    batchId?: string;
    sectionId?: string;
  }): Promise<{
    departments: Department[];
    batches: Batch[];
    sections: Section[];
    activities: Activity[];
  }> => {
    const cleanFilter: Record<string, string> = {};
    if (filter?.departmentId) cleanFilter.departmentId = filter.departmentId;
    if (filter?.batchId && filter.batchId !== "all") cleanFilter.batchId = filter.batchId;
    if (filter?.sectionId && filter.sectionId !== "all") cleanFilter.sectionId = filter.sectionId;
    const qs = new URLSearchParams(cleanFilter).toString();
    return http(`/api/bootstrap${qs ? `?${qs}` : ""}`);
  },

  /* -------- Departments / Batches / Sections -------- */
  listDepartments: (): Promise<Department[]> => http("/api/departments"),
  listBatches: (departmentId?: string): Promise<Batch[]> =>
    http(`/api/batches${departmentId ? `?departmentId=${departmentId}` : ""}`),
  listSections: (batchId?: string): Promise<Section[]> =>
    http(`/api/sections${batchId ? `?batchId=${batchId}` : ""}`),
  createDepartment: (name: string): Promise<Department> =>
    http("/api/departments", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  updateDepartment: (id: string, name: string): Promise<Department> =>
    http(`/api/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  deleteDepartment: (id: string): Promise<void> =>
    http(`/api/departments/${id}`, { method: "DELETE" }),

  createBatch: (departmentId: string, name: string): Promise<Batch> =>
    http("/api/batches", {
      method: "POST",
      body: JSON.stringify({ departmentId, name }),
    }),
  updateBatch: (id: string, name: string): Promise<Batch> =>
    http(`/api/batches/${id}`, { method: "PUT", body: JSON.stringify({ name }) }),
  deleteBatch: (id: string): Promise<void> =>
    http(`/api/batches/${id}`, { method: "DELETE" }),

  createSection: (batchId: string, name: string): Promise<Section> =>
    http("/api/sections", {
      method: "POST",
      body: JSON.stringify({ batchId, name }),
    }),
  updateSection: (id: string, name: string): Promise<Section> =>
    http(`/api/sections/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  deleteSection: (id: string): Promise<void> =>
    http(`/api/sections/${id}`, { method: "DELETE" }),

  /* -------- Activities -------- */
  listActivities: (filter?: {
    departmentId?: string;
    batchId?: string;
    sectionId?: string;
  }): Promise<Activity[]> => {
    const cleanFilter: Record<string, string> = {};
    if (filter?.departmentId) cleanFilter.departmentId = filter.departmentId;
    // "all" is a UI sentinel meaning "no filter" — never send it to the backend
    if (filter?.batchId && filter.batchId !== "all") cleanFilter.batchId = filter.batchId;
    if (filter?.sectionId && filter.sectionId !== "all") cleanFilter.sectionId = filter.sectionId;
    const qs = new URLSearchParams(cleanFilter).toString();
    return http(`/api/activities${qs ? `?${qs}` : ""}`);
  },
  createActivity: (
    input: Omit<Activity, "id" | "createdAt" | "updatedAt">
  ): Promise<Activity> =>
    http("/api/activities", { method: "POST", body: JSON.stringify(input) }),
  createActivitiesBulk: (
    items: Omit<Activity, "id" | "createdAt" | "updatedAt">[]
  ): Promise<{ count: number; activities: Activity[] }> =>
    http("/api/activities/bulk", {
      method: "POST",
      body: JSON.stringify({ activities: items }),
    }),
  updateActivity: (id: string, patch: Partial<Activity>): Promise<Activity> =>
    http(`/api/activities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteActivity: (id: string): Promise<void> =>
    http(`/api/activities/${id}`, { method: "DELETE" }),

  /* -------- Users / Auth -------- */
  listUsers: (): Promise<User[]> => http("/api/users"),
  createUser: (input: {
    name: string;
    email: string;
    password: string;
    role: Role;
    departmentId?: string;
    batchId?: string;
    sectionId?: string;
  }): Promise<User> =>
    http("/api/users", { method: "POST", body: JSON.stringify(input) }),
  deleteUser: (id: string): Promise<void> =>
    http(`/api/users/${id}`, { method: "DELETE" }),
  login: (
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> =>
    http("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: (): Promise<{ ok: true }> =>
    http("/api/auth/logout", {
      method: "POST",
    }),
  changePassword: (
    current: string,
    next: string
  ): Promise<{ ok: true }> =>
    http("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current, next }),
    }),
};
