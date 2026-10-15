import type { Activity, Batch, Department, Section, User } from "@/types";
import { cookies } from "next/headers";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL!
).replace(/\/$/, "");

async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("access_token");
    if (!cookie?.value) return null;
    return decodeURIComponent(cookie.value);
  } catch {
    return null;
  }
}

async function serverFetch<T>(
  path: string,
  options?: { revalidate?: number }
): Promise<T> {
  if (!API_URL) return [] as unknown as T;

  const token = await getAccessToken();

  if (!token && (path === "/api/auth/me" || path.startsWith("/api/auth/"))) {
    return null as unknown as T;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const reval = options?.revalidate ?? 30;

  try {
    const res = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      next: token ? undefined : { revalidate: reval },
      cache: token ? "no-store" : undefined,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
            Authorization: `Bearer ${token}`,
            Cookie: `access_token=${encodeURIComponent(token)}`,
          }
          : {}),
      },
    });

    if (!res.ok) {
      return (res.status === 401 || res.status === 403 ? null : []) as unknown as T;
    }
    if (res.status === 204) return undefined as T;
    return await res.json();
  } catch {
    return [] as unknown as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const serverApi = {
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
    return serverFetch(`/api/bootstrap${qs ? `?${qs}` : ""}`, { revalidate: 30 });
  },

  listDepartments: (): Promise<Department[]> =>
    serverFetch<Department[]>("/api/departments", { revalidate: 120 }),

  listBatches: (departmentId?: string): Promise<Batch[]> =>
    serverFetch<Batch[]>(
      `/api/batches${departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : ""}`
    ),

  listSections: (batchId?: string): Promise<Section[]> =>
    serverFetch<Section[]>(
      `/api/sections${batchId ? `?batchId=${encodeURIComponent(batchId)}` : ""}`
    ),

  listActivities: (filter?: {
    departmentId?: string;
    batchId?: string;
    sectionId?: string;
  }): Promise<Activity[]> => {
    const cleanFilter: Record<string, string> = {};
    if (filter?.departmentId) cleanFilter.departmentId = filter.departmentId;
    if (filter?.batchId && filter.batchId !== "all") cleanFilter.batchId = filter.batchId;
    if (filter?.sectionId && filter.sectionId !== "all") cleanFilter.sectionId = filter.sectionId;
    const qs = new URLSearchParams(cleanFilter).toString();
    return serverFetch<Activity[]>(`/api/activities${qs ? `?${qs}` : ""}`);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const res = await serverFetch<{ user: User }>("/api/auth/me");
    return res && typeof res === "object" && "user" in res ? res.user : null;
  },

  listUsers: async (): Promise<User[]> => {
    const users = await serverFetch<User[]>("/api/users");
    return Array.isArray(users) ? users : [];
  },
};
