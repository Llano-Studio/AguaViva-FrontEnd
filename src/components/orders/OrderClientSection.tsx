import React from "react";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderClientFields } from "../../config/orders/orderFieldsConfig";
import { useFormOrder } from "../../hooks/useFormOrder";

interface OrderClientSectionProps {
  form: any;
  selectedClient: any;
  setSelectedClient: (client: any) => void;
}

export const OrderClientSection: React.FC<OrderClientSectionProps> = (props) => {
  const { form, selectedClient, setSelectedClient } = props;
  
  const {
    fetchClients,
    fetchClientDetails,
  } = useFormOrder();

const handleClientSelect = async (client: any) => {
  setSelectedClient({ ...client });
  form.setValue("customer_id", client.person_id);
  form.setValue("customer_address", client.address || "");
  form.setValue("customer_id_display", client.person_id || "");
  form.setValue("customer_name", client.name || "");
  form.setValue("phone", client.phone || "");

  // Traer detalles del cliente y móviles de la zona
  const details = await fetchClientDetails(client.person_id);
  if (details?.zone?.zone_id) {
    form.setValue("zone_name", details.zone.name || "");
    form.setValue("zone_id", details.zone.zone_id || "");

  } else {
    form.setValue("zone_name", "");
    form.setValue("mobile", "");
  }
};

  return (
    <fieldset className="order-section">
      <legend>Datos del cliente</legend>
      <ItemFormOrder
        {...form}
        fields={orderClientFields}
        hideActions
        onSubmit={() => {}}
        searchFieldProps={{
          customer_id: {
            value: form.watch("customer_id") || selectedClient?.person_id || "",
            fetchOptions: (query: string) => fetchClients({ personId: query }, "PLAN"),
            renderOption: (client: any) => <span>{client.person_id}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar cliente...",
            class: "order"
          },
          customer_name: {
            value: form.watch("customer_name") || "",
            fetchOptions: (query: string) => fetchClients({ name: query }, "PLAN"),
            renderOption: (client: any) => <span>{client.name}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por nombre...",
            class: "order"
          },
          customer_address: {
            value: form.watch("customer_address") || "",
            fetchOptions: (query: string) => fetchClients({ address: query }, "PLAN"),
            renderOption: (client: any) => <span>{client.address}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por dirección...",
            class: "order"
          },
          phone: {
            value: form.watch("phone") || "",
            fetchOptions: (query: string) => fetchClients({ phone: query }, "PLAN"),
            renderOption: (client: any) => <span>{client.phone}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por teléfono...",
            class: "order"
          }
        }}
      />
    </fieldset>
  );
};