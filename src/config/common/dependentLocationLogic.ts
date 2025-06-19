import { UseFormSetValue, Path, FieldValues } from "react-hook-form";
import { Country, Province, Locality, Zone } from "../../interfaces/Locations";

export function getDependentLocationOptions(
  countries: Country[],
  provinces: Province[],
  localities: Locality[],
  zones: Zone[],
  watchedCountry: number,
  watchedProvince: number,
  watchedLocality: number
) {
  const countryOptions = countries.map(c => ({ label: c.name, value: c.country_id }));
  const provinceOptions = provinces
    .filter(p => p.country_id === watchedCountry)
    .map(p => ({ label: p.name, value: p.province_id }));
  const localityOptions = localities
    .filter(l => l.province_id === watchedProvince)
    .map(l => ({ label: l.name, value: l.locality_id }));
  const zoneOptions = zones
    .filter(z => z.locality && z.locality.locality_id === watchedLocality)
    .map(z => ({ label: z.name, value: z.zone_id }));

  return { countryOptions, provinceOptions, localityOptions, zoneOptions };
}

export function handleDependentLocationChange<T extends FieldValues>(
  setValue: UseFormSetValue<T>
) {
  return (fieldName: keyof T, value: any) => {
    if (fieldName === "countryId") {
      setValue("countryId" as Path<T>, value as any);
      setValue("provinceId" as Path<T>, 0 as any);
      setValue("localityId" as Path<T>, 0 as any);
      setValue("zoneId" as Path<T>, 0 as any);
    } else if (fieldName === "provinceId") {
      setValue("provinceId" as Path<T>, value as any);
      setValue("localityId" as Path<T>, 0 as any);
      setValue("zoneId" as Path<T>, 0 as any);
    } else if (fieldName === "localityId") {
      setValue("localityId" as Path<T>, value as any);
      setValue("zoneId" as Path<T>, 0 as any);
    } else if (fieldName === "zoneId") {
      setValue("zoneId" as Path<T>, value as any);
    }
  };
}