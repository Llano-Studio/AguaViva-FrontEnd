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

  async post<T>(data: any, url: string, options?: { isFormData?: boolean }): Promise<T> {
    const headers = options?.isFormData ? undefined : { "Content-Type": "application/json" };
    return apiFetch<T>(url, {
      method: "POST",
      body: data,
      headers: headers,
    });
  },
  async put<T>(data: any, url: string, options?: { isFormData?: boolean }): Promise<T> {
    return apiFetch<T>(url, {
      method: "PUT",
      body: data,
      headers: options?.isFormData ? undefined : { "Content-Type": "application/json" },
    });
  },

  async patch<T>(data: any, url: string, options?: { params?: Params }): Promise<T> {
    const query = buildQuery(options?.params);
    return apiFetch<T>(url + query, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete<T>(url: string, options?: { params?: Params }): Promise<T> {
    const query = buildQuery(options?.params);
    return apiFetch<T>(url + query, { method: "DELETE" });
  },
};