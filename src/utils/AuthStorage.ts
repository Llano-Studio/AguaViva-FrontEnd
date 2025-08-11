import { AuthUser } from "../interfaces/AuthInterfaces";

const USER_KEY = "user";
const TOKEN_KEY = "token";

export const AuthStorage = {
  saveUser: (user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): AuthUser | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  saveToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
};
