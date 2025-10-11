import { Field, Column } from "../../interfaces/Common";
import { CreateLocalityDTO, Locality } from "../../interfaces/Locations";

export const localityFields: Field<CreateLocalityDTO>[] = [
  {
    name: "name",
    label: "Nombre",
    type: "text",
    validation: { required: true },
    order: 1,
  },
  {
    name: "code",
    label: "Código",
    type: "text",
    validation: { required: true },
    order: 2,
  },
  {
    name: "countryId",
    label: "País",
    type: "select",
    validation: { required: true },
    order: 3,
  },
  {
    name: "provinceId",
    label: "Provincia",
    type: "select",
    validation: { required: true },
    order: 4,
  },
];

export const localityColumns: Column<Locality>[] = [
  { header: "ID", accessor: "locality_id", order: 1 },
  { header: "Nombre", accessor: "name", order: 2 },
  { header: "Código", accessor: "code", order: 3 },
  { header: "Provincia", accessor: "province.name", order: 4 },
  { header: "Pais", accessor: "province.country.name", order: 5 },
];