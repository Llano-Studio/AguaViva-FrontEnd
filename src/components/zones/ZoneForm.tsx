import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CreateZoneDTO } from "../../interfaces/Zones";
import { Zone } from "../../interfaces/Locations";
import { ItemForm } from "../common/ItemForm";
import { zoneFields } from "../../config/zones/zoneFieldsConfig";
import useZones from "../../hooks/useZones";
import { useDependentLocationFields } from "../../hooks/useDependentLocationFields";
import { getDependentLocationOptions, handleDependentLocationChange } from "../../config/common/dependentLocationLogic";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";

interface ZoneFormProps {
  onCancel: () => void;
  isEditing: boolean;
  zoneToEdit?: Zone | null;
  refreshZones: () => Promise<void>;
  class?: string;
  onSuccess?: (msg: string) => void;
}

const getInitialValues = (
  isEditing: boolean,
  zoneToEdit?: Zone | null
): CreateZoneDTO => {
  if (isEditing && zoneToEdit && zoneToEdit.locality) {
    const locality = zoneToEdit.locality;
    const province = locality.province;
    const country = province.country;
    return {
      name: zoneToEdit.name,
      code: zoneToEdit.code,
      localityId: locality.locality_id,
      provinceId: province.province_id,
      countryId: country.country_id,
    };
  }
  return {
    name: "",
    code: "",
    localityId: 0,
    countryId: undefined,
    provinceId: undefined,
  };
};

const ZoneForm: React.FC<ZoneFormProps> = ({
  onCancel,
  isEditing,
  zoneToEdit,
  refreshZones,
  class: classForm,
  onSuccess,
}) => {
  const { createZone, updateZone } = useZones();
  const [error, setError] = useState<string | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateZoneDTO | null>(null);
  const { showSnackbar } = useSnackbar();

  const initialValues = useMemo(
    () => getInitialValues(isEditing, zoneToEdit),
    [isEditing, zoneToEdit]
  );

  // Hook para selects dependientes
  const {
    countries,
    provinces,
    localities,
  } = useDependentLocationFields();

  // React Hook Form para controlar los valores
  const form = useForm<CreateZoneDTO>({
    defaultValues: initialValues,
  });

  const { watch, setValue } = form;

  // Usar watch para obtener los valores actuales de los selects
  const watchedCountry = watch("countryId");
  const watchedProvince = watch("provinceId");
  const watchedLocality = watch("localityId");

  // Opciones filtradas según la selección actual
  const {
    countryOptions,
    provinceOptions,
    localityOptions,
  } = getDependentLocationOptions(
    countries,
    provinces,
    localities,
    [],
    watchedCountry ?? 0,
    watchedProvince ?? 0,
    watchedLocality ?? 0
  );

  // Handler reutilizable
  const handleFieldChange = handleDependentLocationChange<CreateZoneDTO>(setValue);

  // Solo enviar los campos requeridos al backend
  const handleSubmit = async (values: CreateZoneDTO | FormData) => {
    try {
      if (values instanceof FormData) {
        setError("No se admiten archivos en este formulario.");
        return;
      }
      if (isEditing && zoneToEdit) {
        setPendingValues(values);
        setShowUpdateConfirm(true);
        return;
      }
      // Crear zona
      const payload = {
        name: values.name,
        code: values.code,
        localityId: values.localityId,
      };
      const success = await createZone(payload);
      if (success) {
        await refreshZones();
        if (onSuccess) onSuccess("Zona creada correctamente.");
        showSnackbar("Zona creada correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar la zona");
        showSnackbar("Error al guardar la zona", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar la zona");
      showSnackbar(err?.message || "Error al guardar la zona", "error");
      console.error(err);
    }
  };

  // Confirmación de edición
  const handleConfirmUpdate = async () => {
    if (!pendingValues || !zoneToEdit) return;
    try {
      const payload = {
        name: pendingValues.name,
        code: pendingValues.code,
        localityId: pendingValues.localityId,
      };
      const success = await updateZone(zoneToEdit.zone_id, payload);
      if (success) {
        await refreshZones();
        if (onSuccess) onSuccess("Zona editada correctamente.");
        showSnackbar("Zona editada correctamente.", "success");
        onCancel();
      } else {
        setError("Error al actualizar la zona");
        showSnackbar("Error al actualizar la zona", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al actualizar la zona");
      showSnackbar(err?.message || "Error al actualizar la zona", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      <ItemForm<CreateZoneDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={zoneFields(countryOptions, provinceOptions, localityOptions)}
        class={classForm}
        onFieldChange={handleFieldChange as (fieldName: string, value: any) => void}
      />
      {error && <div className="error-message">{error}</div>}
      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="zona"
        genere="F"
      />
    </>
  );
};

export default ZoneForm;