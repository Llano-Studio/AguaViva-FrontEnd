import { apiFetch } from "../utils/apiFetch";

type Params = Record<string, any>;

const buildQuery = (params?: Params) => {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else if (value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const httpAdapter = {
  async get<T>(url: string, options?: { params?: Params }): Promise<T> {
    const query = buildQuery(options?.params);
    return apiFetch<T>(url + query, { method: "GET" });
  },

  async post<T>(data: any, url: string, options?: { params?: Params }): Promise<T> {
    const query = buildQuery(options?.params);
    return apiFetch<T>(url + query, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async put<T>(data: any, url: string, options?: { params?: Params }): Promise<T> {
    const query = buildQuery(options?.params);
    return apiFetch<T>(url + query, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete<T>(url: string, options?: { params?: Params }): Promise<T> {
    const query = buildQuery(options?.params);
    return apiFetch<T>(url + query, { method: "DELETE" });
  },
};