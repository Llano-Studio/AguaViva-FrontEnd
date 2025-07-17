/**
 * Convierte una fecha ISO a "DD/MM/YYYY" para mostrar en modales.
 */
export function formatDateForView(isoDate?: string | null): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}