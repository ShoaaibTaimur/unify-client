export type Role = "student" | "cr" | "teacher" | "admin";
export type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous" | "offline";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
  mustChangePassword: boolean;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
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
  status: AuthStatus;
  isAuthenticated: boolean;
  loaded: boolean;
  isPending: boolean;
  isOffline: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  createUser: (input: CreateUserInput) => Promise<User>;
  changePassword: (current: string, next: string) => Promise<void>;
  refetch: () => Promise<void>;
}
