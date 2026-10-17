import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { authClient } from "@/lib/auth-client";
import type {
  Activity,
  ActivityFilter,
  Batch,
  ClassSelection,
  CreateUserInput,
  Department,
  Section,
  User,
  ActivityInput,
  AdminOverviewPayload,
  AdminUsersPayload,
  AdminUsersRequest,
  ApiError,
  CalendarPayload,
  OrganizationPayload,
  PortalDashboardPayload,
  PublicDashboardPayload,
  UserUpdate,
  CsvPreview,
  CsvRequest,
} from "@/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export const LIVE_UPDATE_CLIENT_ID =
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

function buildQueryString(values?: object) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values ?? {})) {
    if (value && value !== "all") params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

const sendServerRequest: BaseQueryFn<
  { url: string; method?: string; body?: unknown },
  unknown,
  ApiError
> = async ({ url, method = "GET", body }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await authClient.fetch(`${API_URL}${url}`, {
      method,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "X-Unify-Client": LIVE_UPDATE_CLIENT_ID,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      return {
        error: {
          status: response.status,
          data: {
            error:
              typeof payload?.error === "string"
                ? payload.error
                : `Request failed (${response.status})`,
            code: typeof payload?.code === "string" ? payload.code : undefined,
          },
        },
      };
    }

    return {
      data: response.status === 204 ? undefined : await response.json(),
    };
  } catch (error) {
    const timedOut = controller.signal.aborted;
    return {
      error: {
        status: timedOut ? "TIMEOUT_ERROR" : "FETCH_ERROR",
        data: {
          error: timedOut
            ? "Request timed out. Check your network or server."
            : error instanceof Error
              ? error.message
              : "Unable to reach server",
        },
      },
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const serverApi = createApi({
  reducerPath: "serverApi",
  baseQuery: sendServerRequest,
  tagTypes: ["Dashboard", "Activity", "Organization", "User"],
  keepUnusedDataFor: 300,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    publicDashboard: builder.query<PublicDashboardPayload, ClassSelection | null>({
      query: (selection) => ({
        url: `/api/views/public-dashboard${buildQueryString(selection ?? undefined)}`,
      }),
      providesTags: ["Dashboard", "Activity", "Organization"],
    }),
    portalDashboard: builder.query<PortalDashboardPayload, void>({
      query: () => ({ url: "/api/views/portal-dashboard" }),
      providesTags: ["Dashboard", "Activity", "Organization"],
    }),
    adminOverview: builder.query<AdminOverviewPayload, void>({
      query: () => ({ url: "/api/views/admin-overview" }),
      providesTags: ["Dashboard", "Activity", "Organization", "User"],
    }),
    adminUsers: builder.query<AdminUsersPayload, AdminUsersRequest>({
      query: (request) => ({ url: `/api/views/admin-users${buildQueryString(request)}` }),
      providesTags: ["User", "Organization"],
    }),
    organization: builder.query<OrganizationPayload, void>({
      query: () => ({ url: "/api/views/organization" }),
      providesTags: ["Organization"],
    }),
    departments: builder.query<Department[], void>({
      query: () => ({ url: "/api/departments" }),
      providesTags: ["Organization"],
    }),
    batches: builder.query<Batch[], string | void>({
      query: (departmentId) => ({
        url: `/api/batches${buildQueryString({ departmentId: departmentId || undefined })}`,
      }),
      providesTags: ["Organization"],
    }),
    sections: builder.query<Section[], string | void>({
      query: (batchId) => ({
        url: `/api/sections${buildQueryString({ batchId: batchId || undefined })}`,
      }),
      providesTags: ["Organization"],
    }),
    activities: builder.query<Activity[], ActivityFilter | void>({
      query: (filter) => ({
        url: `/api/activities${filter ? buildQueryString(filter) : ""}`,
      }),
      providesTags: ["Activity"],
    }),
    calendar: builder.query<
      CalendarPayload,
      { selection: ClassSelection; month: string }
    >({
      query: ({ selection, month }) => ({
        url: `/api/views/calendar${buildQueryString({ ...selection, month })}`,
      }),
      providesTags: ["Activity"],
    }),
    navigation: builder.query<{ hasActiveExams: boolean }, ClassSelection>({
      query: (selection) => ({
        url: `/api/views/navigation${buildQueryString(selection)}`,
      }),
      providesTags: ["Activity"],
    }),
    createActivity: builder.mutation<Activity, ActivityInput>({
      query: (body) => ({ url: "/api/activities", method: "POST", body }),
      invalidatesTags: ["Activity", "Dashboard"],
    }),
    createActivitiesBulk: builder.mutation<
      { count: number; activities: Activity[] },
      ActivityInput[]
    >({
      query: (activities) => ({
        url: "/api/activities/bulk",
        method: "POST",
        body: { activities },
      }),
      invalidatesTags: ["Activity", "Dashboard"],
    }),
    previewActivitiesCsv: builder.mutation<CsvPreview, CsvRequest>({
      query: (body) => ({ url: "/api/activities/csv/preview", method: "POST", body }),
    }),
    importActivitiesCsv: builder.mutation<{ count: number }, CsvRequest>({
      query: (body) => ({ url: "/api/activities/csv/import", method: "POST", body }),
      invalidatesTags: ["Activity", "Dashboard"],
    }),
    updateActivity: builder.mutation<Activity, { id: string; patch: Partial<Activity> }>({
      query: ({ id, patch }) => ({ url: `/api/activities/${id}`, method: "PATCH", body: patch }),
      invalidatesTags: ["Activity", "Dashboard"],
    }),
    deleteActivity: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/activities/${id}`, method: "DELETE" }),
      invalidatesTags: ["Activity", "Dashboard"],
    }),
    clearActivities: builder.mutation<{ ok: boolean; deletedCount: number }, void>({
      query: () => ({ url: "/api/activities", method: "DELETE" }),
      invalidatesTags: ["Activity", "Dashboard"],
    }),
    createDepartment: builder.mutation<Department, string>({
      query: (name) => ({ url: "/api/departments", method: "POST", body: { name } }),
      invalidatesTags: ["Organization", "Dashboard", "User"],
    }),
    updateDepartment: builder.mutation<Department, { id: string; name: string }>({
      query: ({ id, name }) => ({ url: `/api/departments/${id}`, method: "PUT", body: { name } }),
      invalidatesTags: ["Organization", "Dashboard", "User"],
    }),
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/departments/${id}`, method: "DELETE" }),
      invalidatesTags: ["Organization", "Dashboard", "User"],
    }),
    createBatch: builder.mutation<Batch, { departmentId: string; name: string }>({
      query: (body) => ({ url: "/api/batches", method: "POST", body }),
      invalidatesTags: ["Organization", "Dashboard", "User"],
    }),
    updateBatch: builder.mutation<Batch, { id: string; name: string }>({
      query: ({ id, name }) => ({ url: `/api/batches/${id}`, method: "PUT", body: { name } }),
      invalidatesTags: ["Organization", "Dashboard", "User"],
    }),
    deleteBatch: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/batches/${id}`, method: "DELETE" }),
      invalidatesTags: ["Organization", "Dashboard", "User"],
    }),
    createSection: builder.mutation<Section, { batchId: string; name: string }>({
      query: (body) => ({ url: "/api/sections", method: "POST", body }),
      invalidatesTags: ["Organization", "Dashboard", "User"],
    }),
    updateSection: builder.mutation<Section, { id: string; name: string }>({
      query: ({ id, name }) => ({ url: `/api/sections/${id}`, method: "PUT", body: { name } }),
      invalidatesTags: ["Organization", "Dashboard", "User"],
    }),
    deleteSection: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/sections/${id}`, method: "DELETE" }),
      invalidatesTags: ["Organization", "Dashboard", "User"],
    }),
    createUser: builder.mutation<User, CreateUserInput>({
      query: (body) => ({ url: "/api/users", method: "POST", body }),
      invalidatesTags: ["User", "Dashboard"],
    }),
    updateUser: builder.mutation<User, UserUpdate>({
      query: ({ id, data }) => ({ url: `/api/users/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["User", "Dashboard"],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User", "Dashboard"],
    }),
    resetUserPassword: builder.mutation<
      { ok: boolean; temporaryPassword: string; user: User },
      { id: string; temporaryPassword?: string }
    >({
      query: ({ id, temporaryPassword }) => ({
        url: `/api/users/${id}/reset-password`,
        method: "POST",
        body: { temporaryPassword },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  usePublicDashboardQuery,
  usePortalDashboardQuery,
  useAdminOverviewQuery,
  useAdminUsersQuery,
  useOrganizationQuery,
  useDepartmentsQuery,
  useBatchesQuery,
  useSectionsQuery,
  useActivitiesQuery,
  useCalendarQuery,
  useNavigationQuery,
  useCreateActivityMutation,
  useCreateActivitiesBulkMutation,
  usePreviewActivitiesCsvMutation,
  useImportActivitiesCsvMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useClearActivitiesMutation,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} = serverApi;

export function getServerErrorMessage(error: unknown): string {
  const apiError = error as ApiError | undefined;
  return apiError?.data?.error ?? (error instanceof Error ? error.message : "Request failed");
}
