/**
 * Formatea una fecha en formato "YYYY-MM-DD" a "DD de mes, YYYY".
 * @param dateString Fecha en formato "YYYY-MM-DD".
 * @returns Fecha formateada en español.
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  console.log("Formatted Date:", date);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};