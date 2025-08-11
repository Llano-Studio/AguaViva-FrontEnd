import { Field, Column } from "../../interfaces/Common";
import { CreateZoneDTO } from "../../interfaces/Zones";
import { Zone } from "../../interfaces/Locations";
import { sortByOrder } from "../../utils/sortByOrder";
import { dependentLocationFields } from "../common/dependentLocationFields";

// Campos del formulario de zona (sin select de zona)
export const zoneFields = (
  countries: { label: string; value: number }[],
  provinces: { label: string; value: number }[],
  localities: { label: string; value: number }[]
): Field<CreateZoneDTO>[] => {
  return sortByOrder([
    { name: "name", label: "Nombre", validation: { required: true }, order: 1 },
    { name: "code", label: "Código", validation: { required: true }, order: 2 },
    ...dependentLocationFields<CreateZoneDTO>(countries, provinces, localities, []).map(f => ({ ...f, order: f.order! + 2 })),
  ]);
};

// Columnas de la tabla de zonas
export const zoneColumns: Column<Zone>[] = sortByOrder([
  { header: "Nombre", accessor: "name", order: 1 },
  { header: "Código", accessor: "code", order: 2 },
  { header: "Localidad", accessor: "locality.name", order: 3 },
]);