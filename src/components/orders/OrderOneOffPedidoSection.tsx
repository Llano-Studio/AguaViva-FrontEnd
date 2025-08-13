import React, { useEffect, useState } from "react";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderOneOffPedidoFields } from "../../config/orders/orderFieldsConfig";
import { useFormOrder } from "../../hooks/useFormOrder";
import { translateDaysToSpanish } from "../../utils/dayTranslations";
import useZones from "../../hooks/useZones";

interface OrderOneOffPedidoSectionProps {
  form: any;
  deliveryPreferences?: any;
}

export const OrderOneOffPedidoSection: React.FC<OrderOneOffPedidoSectionProps> = ({
  form,
  deliveryPreferences,
}) => {
  const { fetchZoneMobiles, fetchZones } = useFormOrder();
  const [mobiles, setMobiles] = useState<any[]>([]);
  const [pickup, setPickup] = useState(false); // Estado para el checkbox
  const { fetchZoneById } = useZones();

  // Leyenda para horarios y días preferidos
  const legend = deliveryPreferences
    ? `Evitar horarios: ${deliveryPreferences.avoid_times?.join(", ") || "-"} | Días preferidos: ${translateDaysToSpanish(deliveryPreferences.preferred_days || []).join(", ") || "-"}`
    : "";

  // Actualiza los móviles cada vez que cambia la zona
  useEffect(() => {
    const zoneId = form.getValues("zone_id");
    if (zoneId) {
      fetchZoneMobiles(zoneId).then(setMobiles);
    } else {
      setMobiles([]);
    }
  }, [form.watch("zone_id")]);

  useEffect(() => {
    if (mobiles.length > 0) {
      form.setValue("mobile", String(mobiles[0].id), { shouldDirty: true });
    } else {
      form.setValue("mobile", "");
    }
  }, [mobiles]);

  // Efecto para setear campos cuando cambia el checkbox
  useEffect(() => {
    if (pickup) {
      form.setValue("requires_delivery", false);
      form.setValue("delivery_address", "");
      form.setValue("scheduled_delivery_date", "");
      form.setValue("delivery_time", "");
      form.setValue("locality_id", "");
      form.setValue("zone_id", "");
    } else {
      form.setValue("requires_delivery", true);
    }
  }, [pickup]);

useEffect(() => {
  const zoneId = form.watch("zone_id");
  if (zoneId) {
    fetchZoneById(zoneId).then((zone) => {
      if (zone && zone.locality && zone.locality.locality_id) {
        const localityId = zone.locality.locality_id;
        form.setValue("customer.localityId", localityId);
        form.setValue("locality_id", localityId);
        console.log(form.getValues("customer.localityId"), "customer.localityId");
        console.log(form.getValues("locality_id"), "locality_id");
      }
    });
  }
}, [form.watch("zone_id")]);

  return (
    <fieldset className="order-section">
      <legend>Datos del pedido</legend>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={pickup}
          onChange={e => setPickup(e.target.checked)}
        />
        Retiro por sucursal
      </label>
      {!pickup && (
        <>
          <ItemFormOrder
            {...form}
            fields={orderOneOffPedidoFields}
            hideActions
            onSubmit={() => {}}
            selectFieldProps={{
              mobile: {
                options: mobiles.map((mobile: any) => ({
                  label: mobile.name || mobile.plate,
                  value: String(mobile.id)
                }))
              }
            }}
            searchFieldProps={{
              zone_id: {
                value: form.watch("zone_name") || "",
                fetchOptions: async (query: string) => {
                  const zones = await fetchZones({ search: query });
                  return zones;
                },
                renderOption: (zone: any) => <span>{zone.name}</span>,
                onOptionSelect: (zone: any) => {
                  form.setValue("zone_id", zone.zone_id);
                  form.setValue("customer.zoneId", zone.zone_id);
                  form.setValue("zone_name", zone.name);
                },
                placeholder: "Buscar zona...",
                class: "order"
              }
            }}
          />
          <p className="order-pedido-section-legend">{legend}</p>
        </>
      )}
    </fieldset>
  );
};