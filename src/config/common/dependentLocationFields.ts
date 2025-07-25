import { Field } from "../../interfaces/Common";

export function dependentLocationFields<T>(
  countryOptions: { label: string; value: number }[],
  provinceOptions: { label: string; value: number }[],
  localityOptions: { label: string; value: number }[],
  zoneOptions: { label: string; value: number }[]
): Field<T>[] {
  const fields: Field<T>[] = [
    { name: "countryId", label: "País", type: "select", options: countryOptions, validation: { required: true }, order: 1 },
    { name: "provinceId", label: "Provincia", type: "select", options: provinceOptions, validation: { required: true }, order: 2 },
    { name: "localityId", label: "Localidad", type: "select", options: localityOptions, validation: { required: true }, order: 3 },
  ];

  // Solo agrega el campo de zona si hay opciones
  if (zoneOptions && zoneOptions.length > 0) {
    fields.push({
      name: "zoneId",
      label: "Zona",
      type: "select",
      options: zoneOptions,
      validation: { required: true },
      order: 4,
    });
  }

  return fields;
}