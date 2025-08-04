import { useState } from "react";
import { VehicleService } from "../services/VehicleService";
import { OrderService } from "../services/OrderService";

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

  const fetchVehicles = async () => {
    const res = await vehicleService.getVehicles();
    // Para cada vehículo, obtenemos su zona
    const vehiclesWithZones = await Promise.all(
      res.data.map(async (v: any) => {
        const zones = await vehicleService.getVehicleZones(v.vehicle_id);
        const zoneId = zones && zones.length > 0 ? zones[0].zone_id : null;
        console.log(`Vehicle ${v.name} has zone ID: ${zoneId}`);
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
    setDrivers(res.map((d: any) => ({
      label: d.name,
      value: d.id,
    })));
  };

  const fetchOrders = async (search = "", zoneId?: number | null) => {
    console.log(`Fetching orders with search: "${search}" and zoneId: ${zoneId}`);
    const params: any = { search };
    if (zoneId) params.zoneId = zoneId;
    const res = await orderService.getOrders(params);
    console.log(`Fetched ${res.data.length} `);
    setOrders(res.data.map((o: any) => ({
      ...o,
      id: o.order_id,
    })));
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Setter que también actualiza el zoneId
  const setSelectedVehicleIdWithZone = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    const vehicle = vehicles.find(v => v.value === vehicleId);
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
    toggleOrderSelection,
    routeNotes,
    setRouteNotes,
    selectedZoneId,
  };
}