import { API_URL } from "../config";

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");

  // Solo agrega Content-Type si viene en options.headers
  let headers: HeadersInit | undefined = options?.headers;

  // Si hay token, agrégalo a los headers
  if (token) {
    headers = { ...(headers || {}), Authorization: `Bearer ${token}` };
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Verificamos si el backend responde con status 403
  if (response.status === 403) {
    window.location.href = "/dashboard";
    return Promise.reject("Acceso denegado");
  }

  if (!response.ok) {
    const error = await response.json();
    return Promise.reject(error);
  }

  return response.json();
}