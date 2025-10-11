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

  const vehicleService = new VehicleService();
  const orderService = new OrderService();
  const orderOneOffService = new OrderOneOffService();

  const fetchVehicles = async () => {
    const res = await vehicleService.getVehicles();
    const vehiclesWithZones = await Promise.all(
      res.data.map(async (v: any) => {
        const zones = await vehicleService.getVehicleZones(v.vehicle_id);
        const zoneId = zones && zones.length > 0 ? zones[0].zone_id : null;
        return {
          label: v.name,
          value: v.vehicle_id,
          zoneId,
        };
      })
    );
    setVehicles(vehiclesWithZones);
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

  // Traer HYBRID + ONE_OFF (solo las que requieren envío) y combinarlas
  // Importante: para HYBRID usar zoneId (camelCase) y para ONE_OFF usar zone_id (snake_case)
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
    const vehicle = vehicles.find((v) => v.value === vehicleId);
    setSelectedZoneId(vehicle ? vehicle.zoneId ?? null : null);
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
  };
}