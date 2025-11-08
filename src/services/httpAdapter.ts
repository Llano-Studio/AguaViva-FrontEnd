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

  async delete<T>(
    url: string,
    dataOrOptions?: any,
    maybeOptions?: { isFormData?: boolean; params?: Params }
  ) {
    let data: any | undefined;
    let options: { isFormData?: boolean; params?: Params } | undefined;

    if (
      dataOrOptions &&
      typeof dataOrOptions === "object" &&
      (("params" in dataOrOptions) || ("isFormData" in dataOrOptions)) &&
      !maybeOptions
    ) {
      // Caso: delete(url, { params })
      options = dataOrOptions;
    } else {
      // Caso: delete(url, body) o delete(url, body, options)
      data = dataOrOptions;
      options = maybeOptions;
    }

    const query = buildQuery(options?.params);
    const isFormData = options?.isFormData;

    const hasBody = typeof data !== "undefined";
    const headers = !isFormData && hasBody ? { "Content-Type": "application/json" } : undefined;
    const body = hasBody ? (isFormData ? data : JSON.stringify(data)) : undefined;

    return apiFetch<T>(url + query, {
      method: "DELETE",
      headers,
      body,
    });
  },
};