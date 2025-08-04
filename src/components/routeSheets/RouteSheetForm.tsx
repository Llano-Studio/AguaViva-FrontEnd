import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useFormRouteSheet } from "../../hooks/useFormRouteSheet";
import { DataTable } from "../common/DataTable";
import { Field } from "../../interfaces/Common";
import { RouteSheet } from "../../interfaces/RouteSheet";
import { deliveryColumns } from "../../config/deliveries/deliveryFieldsConfig";
import "../../styles/css/components/routeSheets/routeSheetForm.css";
import '../../styles/css/components/common/itemForm.css';
import SearchBar from "../common/SearchBar";

interface RouteSheetFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  isEditing?: boolean;
  routeSheetToEdit?: RouteSheet | null;
  onSuccess?: (msg: string) => void;
}

export const RouteSheetForm: React.FC<RouteSheetFormProps> = ({
  onSubmit,
  onCancel,
  loading,
  error,
  className,
}) => {
  const {
    vehicles,
    drivers,
    orders,
    fetchVehicles,
    fetchDrivers,
    orderSearch,
    setOrderSearch,
    fetchOrders,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedDriverId,
    setSelectedDriverId,
    selectedOrders,
    toggleOrderSelection,
    routeNotes,
    setRouteNotes,
    selectedZoneId,
  } = useFormRouteSheet();

  const form = useForm({
    defaultValues: {
      vehicle_id: "",
      driver_id: "",
      route_notes: "",
      orders: [],
    },
  });

  // Para evitar doble fetch en el primer render
  const firstLoad = useRef(true);

  useEffect(() => {
    fetchVehicles();
    fetchOrders();
  }, []);

  // Cuando cambia el móvil, se actualiza la zona y se filtran las órdenes
  useEffect(() => {
    if (!firstLoad.current) {
      fetchOrders(orderSearch, selectedZoneId);
    }
  }, [selectedZoneId]);

  // Cuando cambia el texto de búsqueda, filtra por zona si hay, si no trae todas
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    fetchOrders(orderSearch, selectedZoneId);
  }, [orderSearch]);

  useEffect(() => {
    if (selectedVehicleId) {
      fetchDrivers(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  const handleSubmit = (data: any) => {
    onSubmit({
      vehicle_id: selectedVehicleId,
      driver_id: selectedDriverId,
      route_notes: routeNotes,
      orders: selectedOrders,
    });
  };

  className = "routeSheet";

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={`${className}-form`}>
      <div className={`${className}-form-header-container`}>
        <div className={`${className}-form-header-search`}>
          <SearchBar
            value={orderSearch}
            onChange={setOrderSearch}
            placeholder="Buscar pedidos..."
            class={className}
          />
        </div>
        <div className={`${className}-form-header-content`}>
          <select
            value={selectedVehicleId}
            onChange={e => setSelectedVehicleId(Number(e.target.value))}
            required
          >
            <option value="">Móvil</option>
            {vehicles.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
          <select
            value={selectedDriverId}
            onChange={e => setSelectedDriverId(Number(e.target.value))}
            required
            disabled={!drivers.length}
          >
            <option value="">Chofer</option>
            {drivers.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div style={{ margin: "24px 0" }}>
        <DataTable
          data={orders}
          columns={[
            {
              header: "",
              accessor: "selected",
              render: (_: any, row: any) => (
                <input
                  className="form-checkbox"
                  type="checkbox"
                  checked={selectedOrders.includes(row.id)}
                  onChange={() => toggleOrderSelection(row.id)}
                />
              ),
            },
            ...deliveryColumns,
          ]}
        />
      </div>

      {/* Observaciones */}
      <div className={`${className}-form-notes`}>
        <label>Observaciones</label>
        <textarea
          value={routeNotes}
          onChange={e => setRouteNotes(e.target.value)}
          rows={3}
          placeholder="Observaciones de la hoja de ruta"
        />
      </div>

      {/* Botón */}
      <div style={{ marginTop: 24 }}>
        <button type="submit" disabled={loading} className={`${className}-form-button-submit form-submit`}>
          Generar hoja de ruta
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};