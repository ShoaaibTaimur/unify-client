export type Role = "student" | "cr" | "teacher" | "admin";
export type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous" | "offline";
export type AuthErrorKind = "network" | "server" | "validation";
export type AuthEvent = { type: "session-changed" } | { type: "signed-out" };
export type AuthEventListener = (event: AuthEvent) => void;
export type DashboardRole = Exclude<Role, "student">;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
  departmentName?: string;
  batchName?: string;
  sectionName?: string;
  organizationLabel?: string;
  mustChangePassword: boolean;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User | null;
}

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  lastVerifiedAt: number | null;
}

export interface AuthFailure {
  message: string;
  kind: AuthErrorKind;
}


export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
}

export interface UseAuthReturn {
  user: User | null;
  isPending: boolean;
  isOffline: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  refetch: () => Promise<void>;
}
