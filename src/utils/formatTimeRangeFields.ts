/**
 * Convierte pares de campos start/end en un string "HH:mm" o "HH:mm-HH:mm" y lo coloca en un array si se indica.
 * @param obj El objeto original (ej: delivery_preferences)
 * @param fields Lista de definiciones de campos a transformar
 * @returns El objeto con los campos transformados
 */
export function formatTimeRangeFields<T extends Record<string, any>>(
  obj: T,
  fields: { 
    start: string; 
    end?: string; 
    target: string; 
    asArray?: boolean 
  }[]
): T {
  const result = { ...obj };

  fields.forEach(({ start, end, target, asArray }) => {
    const startValue = obj[start];
    const endValue = end ? obj[end] : undefined;

    let value: string | undefined;
    if (startValue && endValue) {
      value = `${startValue}-${endValue}`;
    } else if (startValue) {
      value = startValue;
    }

    if (value) {
      (result as any)[target] = asArray ? [value] : value;
    }

    // Limpiar los campos originales
    delete result[start];
    if (end) delete result[end];
  });

  return result;
}