import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { DatePickerWithLabel } from "../common/DatePickerWithLabel";
import { mapOrdersForTable } from "../../utils/mapOrdersForTable";
import { useSnackbar } from "../../context/SnackbarContext";

interface RouteSheetFormProps {
  onSubmit: (values: any) => Promise<void> | void;
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
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

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
    return today.toISOString().split("T")[0];
  });

  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isDriverAutoSelected, setIsDriverAutoSelected] = useState(true);

  const selectedZoneId = vehicles.find((v) => v.value === selectedVehicleId)?.zoneId || null;

  // Controlar limpieza visual y evitar refetches duplicados
  const isClearingRef = useRef(false);
  const [isClearing, setIsClearing] = useState(false);
  const skipRefetch = useRef(false);

  // Normaliza las órdenes (regulares + one-off) para mostrarlas en la tabla
  const mappedOrders = useMemo(() => mapOrdersForTable(orders as any), [orders]);

  // Helper para refetch según filtros actuales
  const refetchOrdersFor = async (params?: { date?: string; zoneId?: number | null }) => {
    const date = params?.date ?? selectedDate;
    const zoneId =
      typeof params?.zoneId !== "undefined"
        ? params?.zoneId
        : vehicles.find((v) => v.value === selectedVehicleId)?.zoneId || null;

    await fetchOrders(orderSearch, zoneId, {
      deliveryDateFrom: date,
      deliveryDateTo: date,
    });
  };

  // Montaje inicial
  useEffect(() => {
    (async () => {
      await fetchVehicles();
      await refetchOrdersFor({ date: selectedDate, zoneId: selectedZoneId });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-selección por defecto de todas las órdenes listadas
  useEffect(() => {
    if (orders.length > 0) {
      setSelectedOrders(orders.map((order) => (order as any).id));
    } else {
      setSelectedOrders([]);
    }
  }, [orders, setSelectedOrders]);

  // Buscar por texto
  useEffect(() => {
    if (skipRefetch.current) return;
    refetchOrdersFor({ date: selectedDate, zoneId: selectedZoneId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderSearch]);

  // Cargar choferes al cambiar móvil (sin refetch de órdenes aquí para evitar duplicidad)
  useEffect(() => {
    if (selectedVehicleId) {
      fetchDrivers(selectedVehicleId).then(() => {
        if (isDriverAutoSelected && drivers.length > 0) {
          setSelectedDriverId(drivers[0].value);
        } else if (drivers.length === 0) {
          setSelectedDriverId("");
        }
      });
    } else {
      setSelectedDriverId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicleId, isDriverAutoSelected]);

  useEffect(() => {
    setFormattedDate(formatDate(selectedDate));
  }, [selectedDate]);

  // Limpiar y pedir de nuevo al cambiar fecha
  const handleDateChange = async (date: string) => {
    skipRefetch.current = true;
    isClearingRef.current = true;
    setIsClearing(true);
    setSelectedOrders([]);
    setSelectedDate(date);

    try {
      await refetchOrdersFor({ date, zoneId: selectedZoneId });
    } finally {
      isClearingRef.current = false;
      setIsClearing(false);
      setTimeout(() => {
        skipRefetch.current = false;
      }, 0);
    }
  };

  // Limpiar y pedir de nuevo al cambiar móvil
  const handleVehicleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVehicleId = Number(e.target.value);
    const newZoneId = vehicles.find((v) => v.value === newVehicleId)?.zoneId || null;

    skipRefetch.current = true;
    isClearingRef.current = true;
    setIsClearing(true);
    setSelectedOrders([]);
    setSelectedVehicleId(newVehicleId);
    setIsDriverAutoSelected(true);

    try {
      await refetchOrdersFor({ date: selectedDate, zoneId: newZoneId });
    } finally {
      isClearingRef.current = false;
      setIsClearing(false);
      setTimeout(() => {
        skipRefetch.current = false;
      }, 0);
    }
  };

  // Limpiar y pedir de nuevo al cambiar chofer (aunque no afecte filtros, para evitar residuo visual)
  const handleDriverChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDriverId = Number(e.target.value);
    setSelectedDriverId(newDriverId);
    setIsDriverAutoSelected(false);

    skipRefetch.current = true;
    isClearingRef.current = true;
    setIsClearing(true);
    setSelectedOrders([]);

    try {
      await refetchOrdersFor({ date: selectedDate, zoneId: selectedZoneId });
    } finally {
      isClearingRef.current = false;
      setIsClearing(false);
      setTimeout(() => {
        skipRefetch.current = false;
      }, 0);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const details = selectedOrders.map((orderId) => {
        const order = (orders as any[]).find((o) => (o as any).id === orderId) as any;

        const isOneOff =
          String(order?.order_type ?? (order?.purchase_id ? "ONE_OFF" : "HYBRID")) === "ONE_OFF";
        const resolvedOrderType = (order?.order_type ?? (isOneOff ? "ONE_OFF" : "HYBRID")) as any;

        const detail: any = {
          order_type: resolvedOrderType,
          delivery_status: "PENDING",
          delivery_time: String(order?.delivery_time || ""),
          comments: "",
        };

        if (isOneOff) {
          // Enviar SIEMPRE el header id (mismo valor, distinto nombre de campo)
          const headerId =
            order?.one_off_purchase_header_id ??
            order?.purchase_header_id ??
            order?.purchase_id ??
            order?.one_off_purchase_id;

          if (headerId) {
            detail.one_off_purchase_header_id = Number(headerId);
          }
          // Nota: no enviar one_off_purchase_id
        } else {
          // HYBRID: solo order_id (+ cycle_payment_id si aplica)
          detail.order_id = Number(order?.order_id ?? 0);
          if (order?.cycle_payment_id) detail.cycle_payment_id = Number(order.cycle_payment_id);
        }

        return detail;
      });

      const routeSheetData: CreateRouteSheetDTO = {
        driver_id: (selectedDriverId as number) || 0,
        vehicle_id: (selectedVehicleId as number) || 0,
        delivery_date: selectedDate,
        route_notes: routeNotes || "",
        details,
      };

      await onSubmit(routeSheetData);

      if (onSuccess) {
        onSuccess("Hoja de ruta creada correctamente.");
      } else {
        showSnackbar("Hoja de ruta creada correctamente.", "success");
      }

      navigate("/entregas");
    } catch (err: any) {
      showSnackbar(err?.message || "Error al crear la hoja de ruta", "error");
      // no navegamos en error
    }
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
          <DatePickerWithLabel
            value={selectedDate}
            onChange={handleDateChange}
            className={className}
          />

          <select
            value={selectedVehicleId}
            onChange={handleVehicleChange}
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
        <DataTable<any>
          data={isClearing ? [] : mappedOrders}
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
            ...(deliveryColumns as any),
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
        >
          Generar hoja de ruta
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};