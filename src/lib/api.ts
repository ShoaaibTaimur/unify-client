/**
 * UNIFY API client.
 *
 * All data is loaded from the real backend. Set the backend URL via env:
 *
 *     VITE_API_URL=https://your-backend.vercel.app
 *
 * Without this variable, every request throws a clear error so nothing
 * silently falls back to fake data.
 */
import type { Activity, Batch, Department, Section, User } from "./types";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

export const isApiConfigured = Boolean(API_URL);

function requireApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "Backend not configured. Set VITE_API_URL to your deployed API URL (e.g. https://your-backend.vercel.app).",
    );
  }
  return API_URL;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const base = requireApiUrl();
  const token = typeof window !== "undefined" ? localStorage.getItem("unify_token") : null;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = typeof body.error === "string" ? body.error : JSON.stringify(body.error);
    } catch {
      try { msg = await res.text() || msg; } catch { /* ignore */ }
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  /* -------- Departments / Batches / Sections -------- */
  listDepartments: (): Promise<Department[]> => http("/api/departments"),
  listBatches: (departmentId?: string): Promise<Batch[]> =>
    http(`/api/batches${departmentId ? `?departmentId=${departmentId}` : ""}`),
  listSections: (batchId?: string): Promise<Section[]> =>
    http(`/api/sections${batchId ? `?batchId=${batchId}` : ""}`),
  createDepartment: (name: string): Promise<Department> =>
    http("/api/departments", { method: "POST", body: JSON.stringify({ name }) }),
  createBatch: (departmentId: string, name: string): Promise<Batch> =>
    http("/api/batches", { method: "POST", body: JSON.stringify({ departmentId, name }) }),
  createSection: (batchId: string, name: string): Promise<Section> =>
    http("/api/sections", { method: "POST", body: JSON.stringify({ batchId, name }) }),

  /* -------- Activities -------- */
  listActivities: (filter?: { departmentId?: string; batchId?: string; sectionId?: string }): Promise<Activity[]> => {
    const qs = filter ? new URLSearchParams(filter as Record<string, string>).toString() : "";
    return http(`/api/activities${qs ? `?${qs}` : ""}`);
  },
  createActivity: (input: Omit<Activity, "id" | "createdAt" | "updatedAt">): Promise<Activity> =>
    http("/api/activities", { method: "POST", body: JSON.stringify(input) }),
  updateActivity: (id: string, patch: Partial<Activity>): Promise<Activity> =>
    http(`/api/activities/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteActivity: (id: string): Promise<void> =>
    http(`/api/activities/${id}`, { method: "DELETE" }),

  /* -------- Users / Auth -------- */
  listUsers: (): Promise<User[]> => http("/api/users"),
  login: (email: string, password: string): Promise<{ token: string; user: User }> =>
    http("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  changePassword: (current: string, next: string): Promise<{ ok: true }> =>
    http("/api/auth/change-password", { method: "POST", body: JSON.stringify({ current, next }) }),
};
