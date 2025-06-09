import React from "react";
import { ItemForm, Field } from "../common/ItemForm";
import { Client, CreateClientDTO, ClientType } from "../../interfaces/Client";
import useClients from "../../hooks/useClients";
import { clientFields } from "../../config/clients/clientFieldsConfig";

interface ClientFormProps {
  onCancel: () => void;
  isEditing: boolean;
  clientToEdit?: Client;
  refreshClients: () => Promise<any>;
  class?: string;
}

const ClientForm: React.FC<ClientFormProps> = ({
  onCancel,
  isEditing,
  clientToEdit,
  refreshClients,
  class: classForm,
}) => {
  const { createClient, updateClient } = useClients();

  const emptyClient: CreateClientDTO = {
    name: "",
    phone: "",
    address: "",
    taxId: "",
    localityId: 0,
    zoneId: 0,
    registrationDate: "",
    type: ClientType.INDIVIDUAL,
  };

  const initialValues = isEditing && clientToEdit
    ? { ...clientToEdit }
    : emptyClient;

  const fields: Field<CreateClientDTO>[] = clientFields;

  const handleSubmit = async (values: CreateClientDTO | FormData) => {
    try {
      let dataToSend: any;
      if (values instanceof FormData) {
        // Si algún día agregas archivos, aquí puedes enviar el FormData directamente
        dataToSend = values;
      } else {
        dataToSend = {
          ...values,
          localityId: typeof values.localityId === "string" ? parseInt(values.localityId, 10) : values.localityId,
          zoneId: typeof values.zoneId === "string" ? parseInt(values.zoneId, 10) : values.zoneId,
        };
      }
      let success = false;
      if (isEditing && clientToEdit) {
        success = await updateClient(clientToEdit.person_id, dataToSend);
      } else {
        success = await createClient(dataToSend);
      }
      if (success) {
        await refreshClients();
        onCancel();
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };


  return (
    <ItemForm<CreateClientDTO>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      fields={fields}
      class={classForm}
    />
  );
};

export default ClientForm;