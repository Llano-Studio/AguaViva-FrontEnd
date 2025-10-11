import type { UserRole } from "./User";

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role: UserRole;           
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  profileImageUrl?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  accessToken?: string | null;
  setAccessToken?: (t: string | null) => void;
  logout?: () => void;
  loading?: boolean;
}