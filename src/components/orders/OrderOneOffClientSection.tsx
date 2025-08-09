import React from "react";
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
  const { fetchClients, fetchClientDetails } = useFormOrder();

  // Selección de cliente: setea todos los campos relacionados, igual que OrderClientSection
  const handleClientSelect = async (client: any) => {
    setSelectedClient({ ...client });
    form.setValue("customer.name", client.name || "");
    form.setValue("customer.phone", client.phone || "");
    form.setValue("customer.address", client.address || "");
    form.setValue("customer.alias", client.alias || "");
    form.setValue("customer.taxId", client.taxId || "");
    form.setValue("customer.localityId", client.localityId || 0);
    form.setValue("customer.zoneId", client.zoneId || 0);
    form.setValue("customer.type", client.type || "INDIVIDUAL");

    // Si necesitas traer detalles adicionales (como zona), puedes hacerlo aquí
    if (client.person_id) {
      const details = await fetchClientDetails(client.person_id);
      if (details?.zone?.zone_id) {
        form.setValue("customer.zoneId", details.zone.zone_id);
        form.setValue("zone_id", details.zone.zone_id);
        form.setValue("zone_name", details.zone.name);
      }
      if (details?.locality?.locality_id) {
        form.setValue("customer.localityId", details.locality.locality_id);
        form.setValue("locality_id", details.locality.locality_id);
        console.log("form values after fetching details:", form.getValues());
      }
    }
  };

  return (
    <fieldset className="order-section">
      <legend>Datos del cliente</legend>
      <ItemFormOrder
        {...form}
        fields={orderOneOffClientFields}
        hideActions
        onSubmit={() => {}}
        searchFieldProps={{
          "customer.name": {
            value: form.watch("customer.name") || "",
            fetchOptions: (query: string) => fetchClients({ personId: query }, "INDIVIDUAL"),
            renderOption: (client: any) => <span>{client.name}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por nombre...",
            class: "order"
          },
          "customer.phone": {
            value: form.watch("customer.phone") || "",
            fetchOptions: (query: string) => fetchClients({ phone: query }, "INDIVIDUAL"),
            renderOption: (client: any) => <span>{client.phone}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por teléfono...",
            class: "order"
          },
          "customer.address": {
            value: form.watch("customer.address") || "",
            fetchOptions: (query: string) => fetchClients({ address: query }, "INDIVIDUAL"),
            renderOption: (client: any) => <span>{client.address}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar por dirección...",
            class: "order"
          }
        }}
      />
    </fieldset>
  );
};