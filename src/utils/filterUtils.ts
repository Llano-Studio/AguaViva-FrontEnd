/**
 * Limpia filtros eliminando valores vacíos, undefined, null y arrays vacíos
 * @param filtersToClean Objeto con filtros a limpiar
 * @returns Objeto con filtros limpiados
 */
export const cleanFilters = (filtersToClean: { [key: string]: any }): { [key: string]: any } => {
  return Object.fromEntries(
    Object.entries(filtersToClean).filter(([key, value]) => {
      // Filtrar valores vacíos, undefined, null
      if (value === undefined || value === null || value === "") return false;
      // Filtrar arrays vacíos
      if (Array.isArray(value) && value.length === 0) return false;
      // Filtrar strings vacíos (después de trim)
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    })
  );
};

/**
 * Construye parámetros para peticiones de paginación con filtros limpios
 * @param page Página actual
 * @param limit Límite de elementos por página
 * @param search Término de búsqueda
 * @param filters Filtros a aplicar
 * @param sortBy Campos de ordenamiento
 * @returns Objeto con parámetros listos para enviar al backend
 */
export const buildQueryParams = (
  page: number,
  limit: number,
  search: string,
  filters: { [key: string]: any },
  sortBy?: string
) => {
  const cleanedFilters = cleanFilters(filters);
  
  const params: any = {
    page,
    limit,
    search,
    ...cleanedFilters,
  };

  if (sortBy && sortBy.trim() !== "") {
    params.sortBy = sortBy;
  }

  return params;
};