import React, { useState, useMemo } from "react";
import { CreateClientDTO, Client, ClientType } from "../../interfaces/Client";
import { ItemForm } from "../common/ItemForm";
import { clientFields } from "../../config/clients/clientFieldsConfig";
import useClients from "../../hooks/useClients";
import { useDependentLocationFields } from "../../hooks/useDependentLocationFields";
import { useForm } from "react-hook-form";
import { getDependentLocationOptions, handleDependentLocationChange } from "../../config/common/dependentLocationLogic";
import SubscriptionClient from "./SubscriptionClient";

interface ClientFormProps {
  onCancel: () => void;
  isEditing: boolean;
  clientToEdit?: Client | null;
  refreshClients: () => Promise<void>;
  class?: string;
}

const getInitialValues = (isEditing: boolean, clientToEdit?: Client | null): CreateClientDTO => {
  if (isEditing && clientToEdit) {
    return {
      name: clientToEdit.name,
      phone: clientToEdit.phone,
      address: clientToEdit.address,
      alias: clientToEdit.alias,
      taxId: clientToEdit.taxId,
      countryId: clientToEdit.locality?.province?.country?.country_id ?? 0,
      provinceId: clientToEdit.locality?.province?.province_id ?? 0,
      localityId: clientToEdit.locality?.locality_id ?? 0,
      zoneId: clientToEdit.zone?.zone_id ?? 0,
      registrationDate: clientToEdit.registrationDate?.split('T')[0] ?? "",
      type: clientToEdit.type
    };
  }
  return {
    name: "",
    phone: "",
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
}) => {
  const { createClient, updateClient } = useClients();
  const [error, setError] = useState<string | null>(null);

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
    try {
      let success = false;
      let dataToSend: any = values;

      // Si es un objeto (no FormData), filtra solo los campos requeridos
      if (!(values instanceof FormData)) {
        const {
          name,
          phone,
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
          address,
          alias,
          taxId,
          localityId,
          zoneId,
          registrationDate,
          type
        };
      }

      if (isEditing && clientToEdit) {
        const updatedClient = await updateClient(clientToEdit.person_id, dataToSend);
        success = !!updatedClient;
      } else {
        const newClient = await createClient(dataToSend);
        success = !!newClient;
      }
      if (success) {
        await refreshClients();
        onCancel();
      } else {
        setError("Error al guardar el cliente");
      }
    } catch (err) {
      setError("Error al guardar el cliente");
      console.error(err);
    }
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <ItemForm<CreateClientDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={clientFields(countryOptions, provinceOptions, localityOptions, zoneOptions)}
        class={classForm}
        onFieldChange={handleFieldChange as (fieldName: string, value: any) => void}
      />

      {isEditing && clientToEdit && (
        <SubscriptionClient clientId={clientToEdit.person_id} isEditing={isEditing} />
      )}
    </>
  );
};

export default ClientForm;