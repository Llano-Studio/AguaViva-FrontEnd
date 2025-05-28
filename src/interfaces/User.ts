export interface User {
    id: number;
    email: string;
    name: string;
    role: "ADMIN" | "USER";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
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