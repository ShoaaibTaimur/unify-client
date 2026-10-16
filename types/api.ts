import type {
  Batch,
  ClassSelection,
  Department,
  Section,
} from "./academic";
import type { Activity } from "./activity";
import type { Role, User } from "./auth";

export interface ApiError {
  status: number | "FETCH_ERROR" | "TIMEOUT_ERROR";
  data: { error: string; code?: string };
}

export interface OrganizationPayload {
  departments: Department[];
  batches: Batch[];
  sections: Section[];
  batchesByDepartment?: Record<string, Batch[]>;
  sectionsByBatch?: Record<string, Section[]>;
}

export interface PublicDashboardPayload extends OrganizationPayload {
  selection: ClassSelection | null;
  classLabel: string;
  hasActiveExams: boolean;
  activities: Activity[];
  todayActivities: Activity[];
  nextActivity: Activity | null;
  upNextActivities: Activity[];
}

export interface PortalDashboardPayload {
  user: User;
  organizationLabel: string;
  activities: Activity[];
  stats: { total: number; today: number; upcoming: number };
}

export interface AdminOverviewPayload {
  counts: {
    departments: number;
    batches: number;
    sections: number;
    users: number;
    activities: number;
    upcomingActivities: number;
    completedActivities: number;
    roles: Record<Role, number>;
  };
  recentActivities: Activity[];
}

export interface AdminUsersPayload extends OrganizationPayload {
  users: User[];
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
}

export interface AdminUsersRequest { role: Role; page: number; pageSize: number }

export interface CalendarPayload {
  month: string;
  days: Array<{
    date: string;
    inMonth: boolean;
    activities: Activity[];
    previewActivities: Activity[];
    overflowCount: number;
  }>;
}

export type ActivityInput = Omit<Activity, "id" | "createdAt" | "updatedAt">;

export interface UserUpdate {
  id: string;
  data: {
    name?: string;
    departmentId?: string | null;
    batchId?: string | null;
    sectionId?: string | null;
  };
}

export interface CsvRequest {
  csv: string;
  defaultDepartmentId?: string;
  defaultBatchId?: string;
}

export interface CsvPreviewRow {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  batchName: string;
  sectionName: string;
  activityType: string;
  title: string;
  subject: string;
  scheduleLabel: string;
  timeLabel: string;
}

export interface CsvPreview {
  fatalError?: string;
  total: number;
  validCount: number;
  invalidCount: number;
  rows: CsvPreviewRow[];
}
