/**
 * Formatea una fecha en formato "YYYY-MM-DD" a "DD de mes, YYYY".
 * @param dateString Fecha en formato "YYYY-MM-DD".
 * @returns Fecha formateada en español.
 */
export const formatDate = (dateString: string): string => {
  // Asegura que se interprete como local, no UTC
  const [year, month, day] = dateString.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};