import React from "react";
import { useForm } from "react-hook-form";
import { vehicleZonesFields, VehicleZoneFormData } from "../../config/vehicles/vehicleZonesFieldsConfig";
import { Field, ItemForm } from "../common/ItemForm";
import { getDependentLocationOptions, handleDependentLocationChange } from "../../config/common/dependentLocationLogic";
import { useDependentLocationFields } from "../../hooks/useDependentLocationFields";

interface VehicleZonesFormProps {
  initialValues?: Partial<VehicleZoneFormData>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  countryOptions: { label: string; value: number }[];
  provinceOptions: { label: string; value: number }[];
  localityOptions: { label: string; value: number }[];
  zoneOptions: { label: string; value: number }[];
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
  onFieldChange: (fieldName: string, value: any) => void;
}

const VehicleZonesForm: React.FC<VehicleZonesFormProps> = ({
  initialValues = { isActive: true },
  onSubmit,
  onCancel,
  countryOptions,
  provinceOptions,
  localityOptions,
  zoneOptions,
  loading,
  error,
  isEditing,
  onFieldChange,
}) => {
  const form = useForm<VehicleZoneFormData>({
    defaultValues: initialValues
  });

  const { watch, setValue } = form;

  // Usar watch para obtener los valores actuales de los selects dependientes
  const watchedCountry = watch("countryId");
  const watchedProvince = watch("provinceId");
  const watchedLocality = watch("localityId");

  // Opciones filtradas según la selección actual
  const { countries, provinces, localities, zones } = useDependentLocationFields();

  const {
    countryOptions: filteredCountryOptions,
    provinceOptions: filteredProvinceOptions,
    localityOptions: filteredLocalityOptions,
    zoneOptions: filteredZoneOptions,
  } = getDependentLocationOptions(
    countries,      
    provinces,     
    localities,     
    zones,         
    watchedCountry ?? 0,
    watchedProvince ?? 0,
    watchedLocality ?? 0
  );

  // Handler reutilizable para selects dependientes
  const handleFieldChangeInternal = handleDependentLocationChange<VehicleZoneFormData>(setValue);

  const handleFieldChangeWrapper = (fieldName: string, value: any) => {
    handleFieldChangeInternal(fieldName as keyof VehicleZoneFormData, value);
  };

  const handleSubmit = (values: VehicleZoneFormData | FormData) => {
    if (values instanceof FormData) {
      const formObject: any = {};
      (values as FormData).forEach((value, key) => {
        formObject[key] = value;
      });
      const dataToSend = {
        zoneIds: [Number(formObject.zoneId)],
        notes: formObject.notes,
        isActive: formObject.isActive === 'true' || formObject.isActive === true,
      };
      onSubmit(dataToSend);
    } else {
      const dataToSend = {
        zoneIds: [values.zoneId],
        notes: values.notes,
        isActive: values.isActive,
      };
      onSubmit(dataToSend);
    }
  };

  // Usar los campos con las opciones filtradas
  const fields: Field<VehicleZoneFormData>[] = vehicleZonesFields(
    filteredCountryOptions,
    filteredProvinceOptions,
    filteredLocalityOptions,
    filteredZoneOptions
  );

  return (
    <>
      <ItemForm<VehicleZoneFormData>
        {...form}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        class="vehicle-zones"
        onFieldChange={handleFieldChangeWrapper} // <-- usa el wrapper aquí
      />
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Cargando...</div>}
    </>
  );
};

export default VehicleZonesForm;