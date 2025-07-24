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
    fetchZoneMobiles
  } = useFormOrder();

  const handleClientSelect = async (client: any) => {
    setSelectedClient(client);
    console.log("Cliente seleccionado:", client);
    form.setValue("customer_id", client.person_id);
    form.setValue("customer_address", client.address || "");
    form.setValue("customer_id_display", client.person_id || "");

    // Traer detalles del cliente y móviles de la zona
    const details = await fetchClientDetails(client.person_id);
    console.log("Detalles del cliente:", details);
    if (details?.zone?.zone_id) {
      form.setValue("zone", details.zone.name || "");
      const mobiles = await fetchZoneMobiles(details.zone.zone_id);
      if (mobiles.length > 0) {
        console.log("Móviles de la zona:", mobiles);
        form.setValue("mobile", String(mobiles[0].id));
      } else {
        form.setValue("mobile", "");
      }
    } else {
      form.setValue("zone", "");
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
            value: selectedClient?.name || "",
            fetchOptions: fetchClients,
            renderOption: (client: any) => <span>{client.name}</span>,
            onOptionSelect: handleClientSelect,
            placeholder: "Buscar cliente...",
            class: "order"
          }
        }}
      />
    </fieldset>
  );
};