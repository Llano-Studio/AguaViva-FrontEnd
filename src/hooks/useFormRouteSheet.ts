import { useState } from "react";
import { VehicleService } from "../services/VehicleService";
import { OrderService } from "../services/OrderService";
import { OrderOneOffService } from "../services/OrderOneOffService";

export function useFormRouteSheet() {
  const [vehicles, setVehicles] = useState<{ label: string; value: number; zoneId?: number | null }[]>([]);
  const [drivers, setDrivers] = useState<{ label: string; value: number }[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | "">("");
  const [selectedDriverId, setSelectedDriverId] = useState<number | "">("");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [routeNotes, setRouteNotes] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [vehicleZones, setVehicleZones] = useState<{ label: string; value: number }[]>([]);

  const vehicleService = new VehicleService();
  const orderService = new OrderService();
  const orderOneOffService = new OrderOneOffService();

  const fetchVehicles = async () => {
    const res = await vehicleService.getVehicles();
    const list = res.data.map((v: any) => ({
      label: v.name,
      value: v.vehicle_id,
      zoneId: undefined,
    }));
    setVehicles(list);
  };

  const fetchDrivers = async (vehicleId: number) => {
    const res = await vehicleService.getVehicleUsers(vehicleId);
    setDrivers(
      res.map((d: any) => ({
        label: d.name,
        value: d.id,
      }))
    );
  };

  const fetchVehicleZones = async (vehicleId: number) => {
    const zones = await vehicleService.getVehicleZones(vehicleId);
    const options = (zones || [])
      .filter((vz: any) => vz?.is_active !== false)
      .map((vz: any) => {
        const zone = vz.zone || {};
        return {
          label: zone.name ?? `Zona ${vz.zone_id}`,
          value: vz.zone_id,
        };
      })
      .sort((a: any, b: any) => a.label.localeCompare(b.label));
    setVehicleZones(options);
  };

  // Actualizado: normaliza statuses y fuerza IDs numéricos
  const fetchOrders = async (
    search = "",
    zoneId?: number | null,
    additionalParams?: { [key: string]: any }
  ): Promise<any[]> => {
    const commonParams: any = { search, ...(additionalParams || {}) };

    // Normalizar 'statuses' (solo CSV en param 'statuses')
    if (Array.isArray(commonParams.statuses)) {
      commonParams.statuses = commonParams.statuses.join(",");
    }
    if (commonParams.status && !commonParams.statuses) {
      commonParams.statuses = commonParams.status;
    }
    delete commonParams.status;

    // Construir CSV de zonas
    const zoneCsv =
      commonParams.zone_ids ||
      commonParams.zoneIds ||
      (typeof zoneId === "number" ? String(zoneId) : undefined);

    delete commonParams.zone_ids;
    delete commonParams.zoneIds;

    const regularParams = {
      ...commonParams,
      order_type: "HYBRID",
      ...(zoneCsv ? { zoneIds: zoneCsv } : {}),
      ...(commonParams.statuses ? { statuses: commonParams.statuses } : {}),
    };

    const oneOffParams = {
      ...commonParams,
      order_type: "ONE_OFF",
      requires_delivery: true,
      ...(zoneCsv ? { zone_ids: zoneCsv } : {}),
      ...(commonParams.statuses ? { statuses: commonParams.statuses } : {}),
    };

    const [regularRes, oneOffRes] = await Promise.all([
      orderService.getOrders(regularParams),
      orderOneOffService.getOrdersOneOff(oneOffParams),
    ]);

    const regular = regularRes?.data ?? [];
    const oneOff = oneOffRes?.data ?? [];
    const combined = [...regular, ...oneOff];

    const mapped = combined.map((o: any) => {
      const baseId =
        o.order_id ??
        o.purchase_id ??
        o.one_off_purchase_header_id ??
        o.one_off_purchase_id;

      return {
        ...o,
        id: Number(baseId),
        order_id: o.order_id != null ? Number(o.order_id) : undefined,
        purchase_id: o.purchase_id != null ? Number(o.purchase_id) : undefined,
        one_off_purchase_header_id:
          o.one_off_purchase_header_id != null ? Number(o.one_off_purchase_header_id) : undefined,
        one_off_purchase_id:
          o.one_off_purchase_id != null ? Number(o.one_off_purchase_id) : undefined,
      };
    });

    setOrders(mapped);
    return mapped;
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const setSelectedVehicleIdWithZone = (vehicleId: number | ""): void => {
    setSelectedVehicleId(vehicleId);
    setSelectedZoneId(null);
    setVehicleZones([]);
  };

  return {
    vehicles,
    drivers,
    orders,
    fetchVehicles,
    fetchDrivers,
    orderSearch,
    setOrderSearch,
    fetchOrders,
    selectedVehicleId,
    setSelectedVehicleId: setSelectedVehicleIdWithZone,
    selectedDriverId,
    setSelectedDriverId,
    selectedOrders,
    setSelectedOrders,
    toggleOrderSelection,
    routeNotes,
    setRouteNotes,
    selectedZoneId,
    setSelectedZoneId,
    vehicleZones,
    fetchVehicleZones,
  };
}