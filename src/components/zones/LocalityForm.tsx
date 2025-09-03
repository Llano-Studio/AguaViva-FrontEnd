import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ItemForm } from "../common/ItemForm";
import { CreateLocalityDTO, Locality } from "../../interfaces/Locations";
import useLocations from "../../hooks/useLocations";
import { useSnackbar } from "../../context/SnackbarContext";
import { useDependentLocationFields } from "../../hooks/useDependentLocationFields";
import { localityFields } from "../../config/zones/localityFieldsConfig";

interface LocalityFormProps {
  onCancel: () => void;
  isEditing: boolean;
  localityToEdit?: Locality | null;
  refreshLocalities: () => void;
  onSuccess?: (msg: string) => void;
}

const LocalityForm: React.FC<LocalityFormProps> = ({
  onCancel,
  isEditing,
  localityToEdit,
  refreshLocalities,
  onSuccess,
}) => {
  const { createLocality, updateLocality } = useLocations();
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  // Hook para obtener países y provincias
  const {
    countries,
    provinces,
  } = useDependentLocationFields(
    localityToEdit?.province?.country?.country_id || 0,
    localityToEdit?.province_id || 0
  );

  // Valores iniciales
  const initialValues: CreateLocalityDTO = useMemo(
    () =>
      isEditing && localityToEdit
        ? {
            name: localityToEdit.name,
            code: localityToEdit.code,
            provinceId: localityToEdit.province_id,
            countryId: localityToEdit.province?.country?.country_id,
          }
        : { name: "", code: "", provinceId: 0, countryId: 0 },
    [isEditing, localityToEdit]
  );

  const form = useForm<CreateLocalityDTO>({
    defaultValues: initialValues,
  });

  const { watch, setValue } = form;

  // Usar watch para obtener los valores actuales
  const watchedCountry = watch("countryId");
  const watchedProvince = watch("provinceId");

  // Opciones filtradas según la selección actual
  const countryOptions = countries.map(c => ({ label: c.name, value: c.country_id }));
  const provinceOptions = provinces.filter(p => p.country_id === watchedCountry)
    .map(p => ({ label: p.name, value: p.province_id }));

  // Campos dinámicos para el formulario
  const dynamicFields = localityFields.map(field => {
    if (field.name === "countryId") {
      return {
        ...field,
        options: countryOptions,
        value: watchedCountry,
        onChange: (name: string, value: any) => setValue(name as keyof CreateLocalityDTO, value),
      };
    }
    if (field.name === "provinceId") {
      return {
        ...field,
        options: provinceOptions,
        value: watchedProvince,
        onChange: (name: string, value: any) => setValue(name as keyof CreateLocalityDTO, value),
      };
    }
    return field;
  });

  // Al enviar, solo envía code, name y provinceId
  const handleSubmit = async (values: CreateLocalityDTO | FormData) => {
    let data: CreateLocalityDTO;
    if (values instanceof FormData) {
      data = {
        name: values.get("name") as string,
        code: values.get("code") as string,
        provinceId: Number(values.get("provinceId")),
      };
    } else {
      data = {
        name: values.name,
        code: values.code,
        provinceId: values.provinceId,
      };
    }
    try {
      let success = false;
      if (isEditing && localityToEdit) {
        await updateLocality(localityToEdit.locality_id, data);
        success = true;
      } else {
        await createLocality(data);
        success = true;
      }
      if (success) {
        await refreshLocalities();
        if (onSuccess) onSuccess(isEditing ? "Localidad editada correctamente." : "Localidad creada correctamente.");
        showSnackbar(isEditing ? "Localidad editada correctamente." : "Localidad creada correctamente.", "success");
        onCancel();
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar la localidad");
      showSnackbar(err?.message || "Error al guardar la localidad", "error");
    }
  };

  return (
    <div style={{marginBottom: "20px"}}>
      <ItemForm<CreateLocalityDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={dynamicFields}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default LocalityForm;