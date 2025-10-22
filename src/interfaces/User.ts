export type UserRole = "ADMINISTRATIVE" | "SUPERADMIN" | "BOSSADMINISTRATIVE" | "DRIVERS";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profileImageUrl?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  role: UserRole;
  profileImage?: File;
}

export interface UsersResponse {
  data: User[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}