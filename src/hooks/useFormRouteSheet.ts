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
      zoneId: undefined, // legacy, no se usa
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
          label: zone.name ?? `Zona ${vz.zone_id}`, // Mostrar el nombre de la zona
          value: vz.zone_id,                        // Enviar zone_id como value
        };
      })
      .sort((a: any, b: any) => a.label.localeCompare(b.label));
    setVehicleZones(options);
  };

  // Traer HYBRID + ONE_OFF (solo las que requieren envío) y combinarlas
  const fetchOrders = async (
    search = "",
    zoneId?: number | null,
    additionalParams?: { [key: string]: any }
  ) => {
    const commonParams: any = { search, status: "PENDING", ...(additionalParams || {}) };

    const regularParams = {
      ...commonParams,
      order_type: "HYBRID",
      ...(zoneId ? { zoneId } : {}),
    };

    const oneOffParams = {
      ...commonParams,
      order_type: "ONE_OFF",
      requires_delivery: true,
      ...(zoneId ? { zone_id: zoneId } : {}),
    };

    const [regularRes, oneOffRes] = await Promise.all([
      orderService.getOrders(regularParams),
      orderOneOffService.getOrdersOneOff(oneOffParams),
    ]);

    const regular = regularRes?.data ?? [];
    const oneOff = oneOffRes?.data ?? [];
    const combined = [...regular, ...oneOff];

    setOrders(
      combined.map((o: any) => ({
        ...o,
        id: o.order_id ?? o.purchase_id, // normaliza id para selección
      }))
    );
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const setSelectedVehicleIdWithZone = (vehicleId: number) => {
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