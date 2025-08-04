import React, { useState } from "react";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderOneOffClientFields } from "../../config/orders/orderFieldsConfig";
import { useFormOrder } from "../../hooks/useFormOrder";

interface OrderOneOffClientSectionProps {
  form: any;
  selectedClient: any;
  setSelectedClient: (client: any) => void;
}

export const OrderOneOffClientSection: React.FC<OrderOneOffClientSectionProps> = ({
  form,
  selectedClient,
  setSelectedClient,
}) => {
  const { fetchClients } = useFormOrder();
  const [clientLocked, setClientLocked] = useState(false);

  const getFetchOptions = (field: string) => async (query: string) => {
    let params: any = {};
    if (field === "customer_id" && query) params.personId = query;
    if (field === "customer_address" && query) params.address = query;
    if (field === "phone" && query) params.phone = query;
    if (field === "customer_name" && query) params.name = query;
    console.log("Llamando fetchClients con INDIVIDUAL");
    return (await fetchClients(params, "INDIVIDUAL")) || [];
    };

  const handleClientSelect = (client: any) => {
    setSelectedClient({ ...client });
    setClientLocked(true);
    form.setValue("person_id", client.person_id);
    form.setValue("customer_name", client.name || "");
    form.setValue("customer_address", client.address || "");
    form.setValue("phone", client.phone || "");
  };

  const handleFieldFocus = () => {
    setClientLocked(false);
    setSelectedClient(null);
    form.setValue("person_id", "");
    form.setValue("customer_name", "");
    form.setValue("customer_address", "");
    form.setValue("phone", "");
  };

  return (
    <fieldset className="order-section">
      <legend>Datos del cliente</legend>
        <ItemFormOrder
        {...form}
        fields={orderOneOffClientFields().map(f => ({
            ...f,
            disabled: clientLocked,
            onFocus: handleFieldFocus,
        }))}
        hideActions
        onSubmit={() => {}}
        searchFieldProps={{
            customer_id: {
            value: form.watch("person_id") ? String(form.watch("person_id")) : "",
            fetchOptions: getFetchOptions("customer_id"),
            renderOption: (client: any) => <span>{client.person_id}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por ID...",
            class: "order"
            },
            customer_name: {
            value: form.watch("customer_name") || "",
            fetchOptions: getFetchOptions("customer_name"),
            renderOption: (client: any) => <span>{client.name}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por nombre...",
            class: "order"
            },
            customer_address: {
            value: form.watch("customer_address") || "",
            fetchOptions: getFetchOptions("customer_address"),
            renderOption: (client: any) => <span>{client.address}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por dirección...",
            class: "order"
            },
            phone: {
            value: form.watch("phone") || "",
            fetchOptions: getFetchOptions("phone"),
            renderOption: (client: any) => <span>{client.phone}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por teléfono...",
            class: "order"
            },
        }}
        />
    </fieldset>
  );
};