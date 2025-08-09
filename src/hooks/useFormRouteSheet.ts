import { useState } from "react";
import { VehicleService } from "../services/VehicleService";
import { OrderService } from "../services/OrderService";

export function useFormRouteSheet() {
  const [vehicles, setVehicles] = useState<{ label: string; value: number; zoneId?: number | null }[]>([]);
  const [drivers, setDrivers] = useState<{ label: string; value: number }[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | "">("");
  const [selectedDriverId, setSelectedDriverId] = useState<number | "">("");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]); // Estado para las órdenes seleccionadas
  const [routeNotes, setRouteNotes] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  const vehicleService = new VehicleService();
  const orderService = new OrderService();

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

  const fetchOrders = async (
    search = "",
    zoneId?: number | null,
    additionalParams?: { [key: string]: any }
  ) => {
    // Siempre incluir status: "PENDING"
    const params: any = { search, status: "PENDING", ...additionalParams };
    if (zoneId) params.zoneId = zoneId;
    const res = await orderService.getOrders(params);
    setOrders(
      res.data.map((o: any) => ({
        ...o,
        id: o.order_id,
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
    setSelectedOrders, // Exponer el setter para las órdenes seleccionadas
    toggleOrderSelection,
    routeNotes,
    setRouteNotes,
    selectedZoneId,
  };
}