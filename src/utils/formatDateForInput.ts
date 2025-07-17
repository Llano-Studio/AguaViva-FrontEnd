/**
 * Convierte una fecha ISO (ej: "2025-07-04T00:00:00.000Z") a "YYYY-MM-DD" para inputs tipo date.
 */
export function formatDateForInput(isoDate?: string | null): string {
  if (!isoDate) return "";
  return isoDate.split("T")[0];
}