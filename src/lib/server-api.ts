import type { Activity, Batch, Department, Section } from "./types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://unify-backend.vercel.app"
).replace(/\/$/, "");

async function serverFetch<T>(path: string, revalidateSeconds = 30): Promise<T> {
  if (!API_URL) return [] as unknown as T;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: revalidateSeconds,
      },
    });

    if (!res.ok) {
      return [] as unknown as T;
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
  listDepartments: (): Promise<Department[]> =>
    serverFetch<Department[]>("/api/departments", 300),

  listBatches: (departmentId?: string): Promise<Batch[]> =>
    serverFetch<Batch[]>(
      `/api/batches${departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : ""}`,
      300
    ),

  listSections: (batchId?: string): Promise<Section[]> =>
    serverFetch<Section[]>(
      `/api/sections${batchId ? `?batchId=${encodeURIComponent(batchId)}` : ""}`,
      300
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
    return serverFetch<Activity[]>(`/api/activities${qs ? `?${qs}` : ""}`, 30);
  },
};
