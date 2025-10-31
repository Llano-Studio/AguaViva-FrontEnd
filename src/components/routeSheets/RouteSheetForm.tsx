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
import { ItemForm } from "../common/ItemForm";

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

type RouteSheetInternalForm = {
  vehicle_id: string | number;
  driver_id: string | number;
  route_notes: string;
  orders: any[];
  zone_ids: number[];
};

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
    // Hook mantiene selectedZoneId (singular) para retrocompatibilidad
    selectedZoneId,
    setSelectedZoneId,
    vehicleZones,
    fetchVehicleZones,
  } = useFormRouteSheet();

  // NUEVO: múltiples zonas seleccionadas para filtros
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);

  const form = useForm<RouteSheetInternalForm>({
    defaultValues: {
      vehicle_id: "",
      driver_id: "",
      route_notes: "",
      orders: [],
      zone_ids: [],
    },
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isDriverAutoSelected, setIsDriverAutoSelected] = useState(true);

  // Controlar limpieza visual y evitar refetches duplicados
  const isClearingRef = useRef(false);
  const [isClearing, setIsClearing] = useState(false);
  const skipRefetch = useRef(false);

  // Normaliza las órdenes (regulares + one-off) para mostrarlas en la tabla
  const mappedOrders = useMemo(() => mapOrdersForTable(orders as any), [orders]);

  // Helper para refetch según filtros actuales (fecha + zonas múltiples)
  const refetchOrdersFor = async (params?: { date?: string; zoneIds?: number[] }) => {
    const date = params?.date ?? selectedDate;
    const zoneIds = params?.zoneIds ?? selectedZoneIds;

    // Enviamos zonas múltiples en ambos formatos por compatibilidad (HYBRID y ONE_OFF)
    const zoneCsv = Array.isArray(zoneIds) && zoneIds.length ? zoneIds.join(",") : undefined;

    await fetchOrders(orderSearch, null, {
      deliveryDateFrom: date,
      deliveryDateTo: date,
      ...(zoneCsv ? { zone_ids: zoneCsv, zoneIds: zoneCsv } : {}),
    });
  };

  // Montaje inicial
  useEffect(() => {
    (async () => {
      await fetchVehicles();
      await refetchOrdersFor({ date: selectedDate, zoneIds: selectedZoneIds });
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
    refetchOrdersFor({ date: selectedDate, zoneIds: selectedZoneIds });
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
      await refetchOrdersFor({ date, zoneIds: selectedZoneIds });
    } finally {
      isClearingRef.current = false;
      setIsClearing(false);
      setTimeout(() => {
        skipRefetch.current = false;
      }, 0);
    }
  };

  // Al cambiar móvil: cargar choferes y zonas, resetear zonas seleccionadas (sin refetch hasta elegir zonas)
  const handleVehicleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVehicleId = Number(e.target.value);

    skipRefetch.current = true;
    isClearingRef.current = true;
    setIsClearing(true);
    setSelectedOrders([]);
    setSelectedVehicleId(newVehicleId);
    setIsDriverAutoSelected(true);

    // resetear zonas en hook (legacy) y locales (múltiple)
    setSelectedZoneId(null);
    setSelectedZoneIds([]);
    form.setValue("zone_ids", []);

    try {
      await Promise.all([fetchDrivers(newVehicleId), fetchVehicleZones(newVehicleId)]);
      // No llamar refetchOrdersFor aquí; se hará al elegir zonas
    } finally {
      isClearingRef.current = false;
      setIsClearing(false);
      setTimeout(() => {
        skipRefetch.current = false;
      }, 0);
    }
  };

  // Limpiar y pedir de nuevo al cambiar chofer (respetando zonas seleccionadas actuales)
  const handleDriverChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDriverId = Number(e.target.value);
    setSelectedDriverId(newDriverId);
    setIsDriverAutoSelected(false);

    skipRefetch.current = true;
    isClearingRef.current = true;
    setIsClearing(true);
    setSelectedOrders([]);

    try {
      await refetchOrdersFor({ date: selectedDate, zoneIds: selectedZoneIds });
    } finally {
      isClearingRef.current = false;
      setIsClearing(false);
      setTimeout(() => {
        skipRefetch.current = false;
      }, 0);
    }
  };

  // Nuevo: cambiar zonas (multiselect) => refetch con esas zonas
  const handleZonesChange = async (zones: number[]) => {
    setSelectedZoneIds(zones);

    skipRefetch.current = true;
    isClearingRef.current = true;
    setIsClearing(true);
    setSelectedOrders([]);

    try {
      await refetchOrdersFor({ date: selectedDate, zoneIds: zones });
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

          {/* Selector de Móvil con ItemForm (select) */}
          <div>
            <ItemForm<RouteSheetInternalForm>
              {...form}
              onSubmit={() => {}}
              hideActions
              class={className + "-vehicle"}
              fields={
                [
                  {
                    name: "vehicle_id",
                    label: "Móvil",
                    type: "select",
                    options: vehicles,
                    validation: { required: true },
                    useReactSelect: true,
                    placeholder: "Móvil",
                  } as any,
                ] as any
              }
              selectFieldProps={{
                vehicle_id: {
                  value: selectedVehicleId === "" ? "" : (selectedVehicleId as number),
                },
              }}
              onFieldChange={(fieldName, value) => {
                if (fieldName === "vehicle_id") {
                  // Reusar la lógica existente
                  handleVehicleChange({ target: { value: String(value ?? "") } } as any);
                }
              }}
              renderInputs={() => <></>}
            />
          </div>

          {/* Reemplazo: selector de Zonas con ItemForm (multiselect) */}
          <div style={{ minWidth: 110 }}>
            <ItemForm<RouteSheetInternalForm>
              {...form}
              onSubmit={() => {}}
              hideActions
              class={className + "-zone"}
              fields={
                [
                  {
                    name: "zone_ids",
                    label: "Zonas",
                    type: "multiselect",
                    options: vehicleZones,
                    isMulti: true,
                    disabled: !vehicleZones.length,
                    validation: { required: true },
                    placeholder: "Seleccionar una o mas...",
                  } as any,
                ] as any
              }
              onFieldChange={(fieldName, value) => {
                if (fieldName === "zone_ids") {
                  const zones = Array.isArray(value) ? (value as number[]) : [];
                  handleZonesChange(zones);
                }
              }}
              renderInputs={() => <></>}
            />
          </div>

          {/* Selector de Chofer con ItemForm (select) */}
          <div>
            <ItemForm<RouteSheetInternalForm>
              {...form}
              onSubmit={() => {}}
              hideActions
              class={className + "-driver"}
              fields={
                [
                  {
                    name: "driver_id",
                    label: "Chofer",
                    type: "select",
                    options: drivers,
                    validation: { required: true },
                    useReactSelect: true,
                    disabled: !drivers.length,
                    placeholder: "Chofer",
                  } as any,
                ] as any
              }
              selectFieldProps={{
                driver_id: {
                  value: selectedDriverId === "" ? "" : (selectedDriverId as number),
                },
              }}
              onFieldChange={(fieldName, value) => {
                if (fieldName === "driver_id") {
                  handleDriverChange({ target: { value: String(value ?? "") } } as any);
                }
              }}
              renderInputs={() => <></>}
            />
          </div>
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