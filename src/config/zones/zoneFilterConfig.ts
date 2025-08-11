import { sortByOrder } from "../../utils/sortByOrder";

export const zoneFilters = sortByOrder([
  {
    name: "locality_ids",
    label: "Localidad",
    type: "select" as const,
    order: 1, 
  },

]);