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

export interface UseSessionReturn {
  user: User | null;
  isPending: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loaded: boolean;
  isPending: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  createUser: (input: CreateUserInput) => Promise<User>;
  changePassword: (current: string, next: string) => Promise<void>;
  refetch: () => Promise<void>;
}
