export interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: string;
  }
  
  export interface AuthContextType {
    user: AuthUser | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
  }
  