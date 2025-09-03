import React, { useState, useMemo } from "react";
import { CreateClientDTO, Client, ClientType } from "../../interfaces/Client";
import { ItemForm } from "../common/ItemForm";
import { clientFields } from "../../config/clients/clientFieldsConfig";
import useClients from "../../hooks/useClients";
import { useDependentLocationFields } from "../../hooks/useDependentLocationFields";
import { useForm } from "react-hook-form";
import { getDependentLocationOptions, handleDependentLocationChange } from "../../config/common/dependentLocationLogic";
import SubscriptionClient from "./SubscriptionClient";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import { formatDateForInput } from "../../utils/formatDateForInput";

interface ClientFormProps {
  onCancel: () => void;
  isEditing: boolean;
  clientToEdit?: Client | null;
  refreshClients: () => Promise<void>;
  class?: string;
  onSuccess?: (msg: string) => void;
}

const getInitialValues = (isEditing: boolean, clientToEdit?: Client | null): CreateClientDTO => {
  if (isEditing && clientToEdit) {
    return {
      name: clientToEdit.name,
      phone: clientToEdit.phone,
      additionalPhones: clientToEdit.additionalPhones,
      address: clientToEdit.address,
      alias: clientToEdit.alias,
      taxId: clientToEdit.taxId,
      countryId: clientToEdit.locality?.province?.country?.country_id ?? 0,
      provinceId: clientToEdit.locality?.province?.province_id ?? 0,
      localityId: clientToEdit.locality?.locality_id ?? 0,
      zoneId: clientToEdit.zone?.zone_id ?? 0,
      registrationDate: formatDateForInput(clientToEdit.registration_date),
      type: clientToEdit.type
    };
  }
  return {
    name: "",
    phone: "",
    additionalPhones: "",
    address: "",
    alias: "",
    taxId: "",
    countryId: 0,
    provinceId: 0,
    localityId: 0,
    zoneId: 0,
    registrationDate: new Date().toISOString().split('T')[0],
    type: ClientType.INDIVIDUAL
  };
};

const ClientForm: React.FC<ClientFormProps> = ({
  onCancel,
  isEditing,
  clientToEdit,
  refreshClients,
  class: classForm,
  onSuccess,
}) => {
  const { createClient, updateClient } = useClients();
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  // Estado para el modal de confirmación de actualización
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateClientDTO | null>(null);

  // Memoiza los valores iniciales para evitar recrear el formulario en cada render
  const initialValues = useMemo(
    () => getInitialValues(isEditing, clientToEdit),
    [isEditing, clientToEdit]
  );

  // Hook para selects dependientes
  const {
    countries,
    provinces,
    localities,
    zones,
  } = useDependentLocationFields();

  // React Hook Form para controlar los valores
  const form = useForm<CreateClientDTO>({
    defaultValues: initialValues
  });

  const { watch, setValue } = form;

  // Usar watch para obtener los valores actuales de los selects
  const watchedCountry = watch("countryId");
  const watchedProvince = watch("provinceId");
  const watchedLocality = watch("localityId");

  // Opciones filtradas según la selección actual (ahora usando lógica reutilizable)
  const {
    countryOptions,
    provinceOptions,
    localityOptions,
    zoneOptions
  } = getDependentLocationOptions(
    countries,
    provinces,
    localities,
    zones,
    watchedCountry,
    watchedProvince,
    watchedLocality
  );

  // Handler reutilizable
  const handleFieldChange = handleDependentLocationChange<CreateClientDTO>(setValue);

  // Submit handler
  const handleSubmit = async (values: CreateClientDTO | FormData) => {
    if (isEditing && clientToEdit) {
      setPendingValues(values as CreateClientDTO);
      setShowUpdateConfirm(true);
      return;
    }
    // Crear cliente (alta normal)
    try {
      let dataToSend: any = values;
      if (!(values instanceof FormData)) {
        const {
          name,
          phone,
          additionalPhones,
          address,
          alias,
          taxId,
          localityId,
          zoneId,
          registrationDate,
          type
        } = values as CreateClientDTO;

        dataToSend = {
          name,
          phone,
          additionalPhones,
          address,
          alias,
          taxId,
          localityId,
          zoneId,
          registrationDate,
          type
        };
      }
      const newClient = await createClient(dataToSend);
      if (newClient) {
        await refreshClients();
        if (onSuccess) onSuccess("Cliente creado correctamente.");
        showSnackbar("Cliente creado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar el cliente");
        showSnackbar("Error al guardar el cliente", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar el cliente");
      showSnackbar(err?.message || "Error al guardar el cliente", "error");
      console.error(err);
    }
  };

  // Confirmación de edición
  const handleConfirmUpdate = async () => {
    if (!pendingValues || !clientToEdit) return;
    try {
      let dataToSend: any = pendingValues;
      if (!(pendingValues instanceof FormData)) {
        const {
          name,
          phone,
          additionalPhones,
          address,
          alias,
          taxId,
          localityId,
          zoneId,
          registrationDate,
          type
        } = pendingValues as CreateClientDTO;

        dataToSend = {
          name,
          phone,
          additionalPhones,
          address,
          alias,
          taxId,
          localityId,
          zoneId,
          registrationDate,
          type
        };
      }
      const updatedClient = await updateClient(clientToEdit.person_id, dataToSend);
      if (updatedClient) {
        await refreshClients();
        if (onSuccess) onSuccess("Cliente editado correctamente.");
        showSnackbar("Cliente editado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al actualizar el cliente");
        showSnackbar("Error al actualizar el cliente", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al actualizar el cliente");
      showSnackbar(err?.message || "Error al actualizar el cliente", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      
      <ItemForm<CreateClientDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={clientFields(countryOptions, provinceOptions, localityOptions, zoneOptions)}
        class={classForm}
        onFieldChange={handleFieldChange as (fieldName: string, value: any) => void}
      />
      {error && <div className="error-message">{error}</div>}

      {isEditing && clientToEdit && (
        <SubscriptionClient clientId={clientToEdit.person_id} isEditing={isEditing} />
      )}

      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="cliente"
        genere="M"
      />
    </>
  );
};

export default ClientForm;