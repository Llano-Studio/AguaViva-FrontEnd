import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useFormRouteSheet } from "../../hooks/useFormRouteSheet";
import { DataTable } from "../common/DataTable";
import { deliveryColumns } from "../../config/deliveries/deliveryFieldsConfig";
import "../../styles/css/components/routeSheets/routeSheetForm.css";
import "../../styles/css/components/common/itemForm.css";
import SearchBar from "../common/SearchBar";
import { RouteSheet, CreateRouteSheetDTO } from "../../interfaces/RouteSheet";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/formatDate"; 


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
  const navigate = useNavigate();
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
    setSelectedOrders,
    toggleOrderSelection,
    routeNotes,
    setRouteNotes,
  } = useFormRouteSheet();

  const form = useForm({
    defaultValues: {
      vehicle_id: "",
      driver_id: "",
      route_notes: "",
      orders: [],
    },
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  });

  const [formattedDate, setFormattedDate] = useState<string>("");

  const [isDriverAutoSelected, setIsDriverAutoSelected] = useState(true);

  const selectedZoneId = vehicles.find((v) => v.value === selectedVehicleId)?.zoneId || null;

  const firstLoad = useRef(true);


  useEffect(() => {
    fetchVehicles();
    fetchOrders(orderSearch, selectedZoneId, {
      deliveryDateFrom: selectedDate,
      deliveryDateTo: selectedDate,
    });
  }, []);

  // Cuando cambian las órdenes, seleccionarlas por defecto
  useEffect(() => {
    if (orders.length > 0) {
      setSelectedOrders(orders.map((order) => order.id)); // Seleccionar todos los IDs de las órdenes
    }
  }, [orders]);

  useEffect(() => {
    if (!firstLoad.current) {
      fetchOrders(orderSearch, selectedZoneId, {
        deliveryDateFrom: selectedDate,
        deliveryDateTo: selectedDate,
      });
    }
  }, [selectedVehicleId, selectedDate]);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    fetchOrders(orderSearch, selectedZoneId, {
      deliveryDateFrom: selectedDate,
      deliveryDateTo: selectedDate,
    });
  }, [orderSearch, selectedDate]);

  useEffect(() => {
    fetchOrders(orderSearch, selectedZoneId, {
      deliveryDateFrom: selectedDate,
      deliveryDateTo: selectedDate,
    });
  }, [selectedDate]);

  useEffect(() => {
    if (selectedVehicleId) {
      // Obtener los choferes del móvil seleccionado
      fetchDrivers(selectedVehicleId).then(() => {
        // Solo establecer automáticamente el primer chofer si está activada la selección automática
        if (isDriverAutoSelected && drivers.length > 0) {
          console.log("Choferes disponibles:", drivers);
      
            setSelectedDriverId(drivers[0].value);
            console.log("Chofer seleccionado automáticamente:", selectedDriverId);
          
        } else if (drivers.length === 0) {
          setSelectedDriverId(""); // Si no hay choferes, limpiar el estado
        }
      });
    } else {
      setSelectedDriverId(""); // Si no hay móvil seleccionado, limpiar el estado
    }
    // Eliminar drivers de las dependencias para evitar bucles
  }, [selectedVehicleId, isDriverAutoSelected]);

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDriverId = Number(e.target.value);
    setSelectedDriverId(newDriverId); // Actualizar el estado del chofer seleccionado
    console.log("Nuevo chofer seleccionado:", newDriverId);
    setIsDriverAutoSelected(false); // Cambiar a selección manual
  };

  useEffect(() => {
    setFormattedDate(formatDate(selectedDate));
  }, [selectedDate]);

  const handleSubmit = (data: any) => {
    const details = selectedOrders.map((orderId) => {
      const order = orders.find((o) => o.id === orderId);
      return {
        order_id: order?.id || 0,
        delivery_status: "PENDING",
        delivery_time: order?.delivery_time || "", // Usar el rango tal como viene
        comments: "",
      };
    });

    const routeSheetData: CreateRouteSheetDTO = {
      driver_id: selectedDriverId || 0,
      vehicle_id: selectedVehicleId || 0,
      delivery_date: selectedDate,
      route_notes: routeNotes || "",
      details,
    };

    onSubmit(routeSheetData);
    navigate("/entregas");
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
          <div className={`${className}-form-date-wrapper`}>
            <img src="/assets/icons/calendar.svg" alt="Calendar Icon" />
            <div className={`${className}-form-date-display`}>
              {formattedDate} {/* Mostrar la fecha formateada */}
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`${className}-form-date-selector`}
            />
          </div>

          <select
            value={selectedVehicleId}
            onChange={(e) => {
              setSelectedVehicleId(Number(e.target.value));
              setIsDriverAutoSelected(true); // Volver a selección automática al cambiar el móvil
            }}
            required
          >
            <option value="">Móvil</option>
            {vehicles.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            value={selectedDriverId}
            onChange={handleDriverChange}
            required
            disabled={!drivers.length}
          >
            <option value="">Chofer</option>
            {drivers.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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

      <div className={`${className}-form-notes`}>
        <label>Observaciones</label>
        <textarea
          value={routeNotes}
          onChange={(e) => setRouteNotes(e.target.value)}
          rows={3}
          placeholder="Observaciones de la hoja de ruta"
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          type="submit"
          disabled={loading}
          className={`${className}-form-button-submit form-submit`}
        >a
          Generar hoja de ruta
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};