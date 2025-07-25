import { Field } from "../../interfaces/Common";
import { dependentLocationFields } from "../common/dependentLocationFields";

export interface VehicleZoneFormData {
  countryId: number;
  provinceId: number;
  localityId: number;
  zoneId: number;
  notes?: string;
  isActive: boolean;
}

export const vehicleZonesFields = (
  countryOptions: { label: string; value: number }[],
  provinceOptions: { label: string; value: number }[],
  localityOptions: { label: string; value: number }[],
  zoneOptions: { label: string; value: number }[]
): Field<VehicleZoneFormData>[] => [
  ...dependentLocationFields<VehicleZoneFormData>(
    countryOptions,
    provinceOptions,
    localityOptions,
    zoneOptions
  ),
  {
    name: "notes",
    label: "Notas",
    type: "textarea",
    validation: { required: false },
    order: 5,
  },
  {
    name: "isActive",
    label: "Activo",
    type: "checkbox",
    validation: { required: false },
    order: 6,
  },
];