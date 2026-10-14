export type Role = "student" | "cr" | "teacher" | "admin";

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

export interface UserSession {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  current: string;
  next: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
}
