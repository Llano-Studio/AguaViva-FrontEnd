import React, { useEffect, useState } from "react";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderPedidoFields } from "../../config/orders/orderFieldsConfig";
import { useFormOrder } from "../../hooks/useFormOrder";
import { translateDaysToSpanish } from "../../utils/dayTranslations";

export const OrderPedidoSection = ({
  form,
  deliveryPreferences,
}: any) => {
  const { fetchZoneMobiles } = useFormOrder();
  const [mobiles, setMobiles] = useState<any[]>([]);

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
  }, [form.watch("zone_id")]); // Escucha cambios en zone_id

  useEffect(() => {
    if (mobiles.length > 0) {
      form.setValue("mobile", String(mobiles[0].id), { shouldDirty: true });
    } else {
      form.setValue("mobile", "");
    }
  }, [mobiles]);

  return (
    <fieldset className="order-section">
      <legend>Datos del pedido</legend>
      <ItemFormOrder
        {...form}
        fields={orderPedidoFields}
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
      />
      <p className="order-pedido-section-legend">{legend}</p>
    </fieldset>
  );
};