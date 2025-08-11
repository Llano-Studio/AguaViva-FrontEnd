/**
 * Convierte campos tipo "09:00-12:00" o ["12:00-13:00"] en campos start/end para el formulario.
 * @param obj El objeto original (ej: delivery_preferences)
 * @param fields Lista de definiciones de campos a transformar
 * @returns El objeto con los campos transformados
 */
export function parseTimeRangeFields<T extends Record<string, any>>(
  obj: T,
  fields: {
    source: string; // campo de la API (string o array)
    start: string;  // campo de inicio para el form
    end: string;    // campo de fin para el form
    isArray?: boolean;
  }[]
): T {
  const result = { ...obj };

  fields.forEach(({ source, start, end, isArray }) => {
    let value = obj[source];

    if (isArray && Array.isArray(value) && value.length > 0) {
      value = value[0];
    }

    if (typeof value === "string" && value.includes("-")) {
    const [startVal, endVal] = value.split("-");
    (result as any)[start] = startVal;
    (result as any)[end] = endVal;
    } else if (typeof value === "string") {
    (result as any)[start] = value;
    (result as any)[end] = "";
    } else {
    (result as any)[start] = "";
    (result as any)[end] = "";
    }
  });

  return result;
}