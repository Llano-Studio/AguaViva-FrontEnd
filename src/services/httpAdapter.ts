import { apiFetch } from "../utils/apiFetch";

type Params = Record<string, any>;

const buildQuery = (params?: Params) => {
  if (!params) return "";
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return query ? `?${query}` : "";
};

export const httpAdapter = {
  async get<T>(url: string, options?: { params?: Params }) {
    const query = buildQuery(options?.params);
    return apiFetch<T>(url + query, { method: "GET" });
  },

  async post<T>(data: any, url: string, options?: { isFormData?: boolean; params?: Params }) {
    const query = buildQuery(options?.params);
    const isFormData = options?.isFormData;
    return apiFetch<T>(url + query, {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
    });
  },

  async put<T>(data: any, url: string, options?: { isFormData?: boolean; params?: Params }) {
    const query = buildQuery(options?.params);
    const isFormData = options?.isFormData;
    return apiFetch<T>(url + query, {
      method: "PUT",
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
    });
  },

  async patch<T>(data: any, url: string, options?: { isFormData?: boolean; params?: Params }) {
    const query = buildQuery(options?.params);
    const isFormData = options?.isFormData;
    return apiFetch<T>(url + query, {
      method: "PATCH",
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
    });
  },

  async delete<T>(url: string, options?: { params?: Params }) {
    const query = buildQuery(options?.params);
    return apiFetch<T>(url + query, { method: "DELETE" });
  },
};