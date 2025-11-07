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
  isEditing,
  routeSheetToEdit,
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
    selectedZoneId,
    setSelectedZoneId,
    vehicleZones,
    fetchVehicleZones,
  } = useFormRouteSheet();

  // Múltiples zonas seleccionadas para filtros
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
  // Evitar auto-selección mientras precargamos edición
  const skipAutoSelectRef = useRef(false);

  // Normaliza las órdenes (regulares + one-off) para mostrarlas en la tabla (y filtra en edición)
  const mappedOrders = useMemo(() => {
    const list = orders as any[];

    if (isEditing && routeSheetToEdit) {
      const includedIds = new Set(
        (routeSheetToEdit.details || [])
          .map((d: any) => Number(d?.order?.order_id))
          .filter((id: any) => Number.isFinite(id))
      );

      const filtered = list.filter((o: any) => {
        const status = o.status || o.order_status || "";
        const oid = Number(o.order_id ?? o.id);
        if (status === "READY_FOR_DELIVERY") {
          return includedIds.has(oid);
        }
        return true; // PENDING u otros
      });

      return mapOrdersForTable(filtered);
    }

    return mapOrdersForTable(list);
  }, [orders, isEditing, routeSheetToEdit]);

  // Helper para refetch según filtros actuales (fecha + zonas múltiples)
  const refetchOrdersFor = async (params?: { date?: string; zoneIds?: number[] }) => {
    const date = params?.date ?? selectedDate;
    const zoneIds = params?.zoneIds ?? selectedZoneIds;

    const zoneCsv = Array.isArray(zoneIds) && zoneIds.length ? zoneIds.join(",") : undefined;

    // Crear => PENDING | Editar => READY_FOR_DELIVERY,PENDING (en ese orden)
    const statusesCsv = isEditing ? "READY_FOR_DELIVERY,PENDING" : "PENDING";

    return await fetchOrders(orderSearch, null, {
      deliveryDateFrom: date,
      deliveryDateTo: date,
      ...(zoneCsv ? { zone_ids: zoneCsv, zoneIds: zoneCsv } : {}),
      // Usar 'statuses' para múltiples estados
      statuses: statusesCsv,
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

  // Auto-selección solo cuando NO estamos editando
  useEffect(() => {
    if (isEditing) return;
    if (skipAutoSelectRef.current) return;
    if (orders.length > 0) {
      setSelectedOrders(orders.map((o: any) => Number(o.id)));
    } else {
      setSelectedOrders([]);
    }
  }, [orders, isEditing, setSelectedOrders]);

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

    // En edición NO limpiamos la selección del usuario
    if (!isEditing) {
      setSelectedOrders([]);
    }

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

    // En edición NO limpiamos la selección del usuario
    if (!isEditing) {
      setSelectedOrders([]);
    }

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

    // En edición NO limpiamos la selección del usuario
    if (!isEditing) {
      setSelectedOrders([]);
    }

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

  // Cambiar zonas (multiselect) => refetch con esas zonas
  const handleZonesChange = async (zones: number[]) => {
    setSelectedZoneIds(zones);

    skipRefetch.current = true;
    isClearingRef.current = true;
    setIsClearing(true);

    // En edición NO limpiamos la selección del usuario
    if (!isEditing) {
      setSelectedOrders([]);
    }

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

  // Inicializar valores cuando se edita una hoja de ruta
  useEffect(() => {
    if (!isEditing || !routeSheetToEdit) return;

    const initFromRouteSheet = async () => {
      try {
        skipAutoSelectRef.current = true;

        const vid = routeSheetToEdit.vehicle?.vehicle_id as number | undefined;
        const did = routeSheetToEdit.driver?.id as number | undefined;

        // Preferir zones_covered si viene; fallback a vehicle.zones
        const zonesSource =
          (routeSheetToEdit.zones_covered && routeSheetToEdit.zones_covered.length
            ? routeSheetToEdit.zones_covered
            : routeSheetToEdit.vehicle?.zones) || [];

        const zones = zonesSource.map((z: any) => Number(z.zone_id));
        const date = routeSheetToEdit.delivery_date || selectedDate;

        setSelectedDate(String(date));
        const notes = routeSheetToEdit.route_notes ?? "";
        setRouteNotes(notes);
        form.setValue("route_notes", notes as any, { shouldDirty: false, shouldValidate: false });

        if (vid) {
          setSelectedVehicleId(vid);
          setIsDriverAutoSelected(false);
          await Promise.all([fetchDrivers(vid), fetchVehicleZones(vid)]);
          form.setValue("vehicle_id", vid as any, { shouldDirty: false, shouldValidate: false });
        } else {
          setSelectedVehicleId("");
          form.setValue("vehicle_id", "" as any, { shouldDirty: false, shouldValidate: false });
        }

        if (did) {
          setSelectedDriverId(did);
          form.setValue("driver_id", did as any, { shouldDirty: false, shouldValidate: false });
        } else {
          form.setValue("driver_id", "" as any, { shouldDirty: false, shouldValidate: false });
        }

        setSelectedZoneIds(zones);
        form.setValue("zone_ids", zones as any, { shouldDirty: false, shouldValidate: false });

        const fetched = await refetchOrdersFor({ date, zoneIds: zones });

        const orderIdsFromDetails: number[] = (routeSheetToEdit.details || [])
          .map((d: any) => d?.order?.order_id)
          .filter((id: any) => typeof id === "number");

        setSelectedOrders(orderIdsFromDetails);
        console.log("Preloaded (edit) orders:", fetched);
      } finally {
        setTimeout(() => {
          skipAutoSelectRef.current = false;
        }, 0);
      }
    };

    void initFromRouteSheet();
  }, [isEditing, routeSheetToEdit]);

  const handleSubmit = async () => {
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
          const headerId =
            order?.one_off_purchase_header_id ??
            order?.purchase_header_id ??
            order?.purchase_id ??
            order?.one_off_purchase_id;
          if (headerId) detail.one_off_purchase_header_id = Number(headerId);
        } else {
          detail.order_id = Number(order?.order_id ?? 0);
          if (order?.cycle_payment_id) detail.cycle_payment_id = Number(order.cycle_payment_id);
        }

        return detail;
      });

      const routeSheetData = {
        driver_id: (selectedDriverId as number) || 0,
        vehicle_id: (selectedVehicleId as number) || 0,
        delivery_date: selectedDate,
        zone_ids: selectedZoneIds, // nuevo campo
        route_notes: routeNotes || "",
        details,
      };

      await onSubmit(routeSheetData);

      if (onSuccess) {
        onSuccess(isEditing ? "Hoja de ruta actualizada correctamente." : "Hoja de ruta creada correctamente.");
      } else {
        showSnackbar(isEditing ? "Hoja de ruta actualizada correctamente." : "Hoja de ruta creada correctamente.", "success");
      }

      navigate("/entregas");
    } catch (err: any) {
      showSnackbar(err?.message || (isEditing ? "Error al actualizar la hoja de ruta" : "Error al crear la hoja de ruta"), "error");
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
                  handleVehicleChange({ target: { value: String(value ?? "") } } as any);
                }
              }}
              renderInputs={() => <></>}
            />
          </div>

          {/* Selector de Zonas con ItemForm (multiselect) */}
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
              render: (_: any, row: any) => {
                const rowId = Number(row.id); // asegurar number
                return (
                  <input
                    className="form-checkbox"
                    type="checkbox"
                    checked={selectedOrders.includes(rowId)}
                    onChange={() => toggleOrderSelection(rowId)}
                  />
                );
              },
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
          {isEditing ? "Guardar cambios" : "Generar hoja de ruta"}
        </button>
        <button
          type="button"
          className="form-cancel"
          style={{ marginLeft: 8 }}
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};