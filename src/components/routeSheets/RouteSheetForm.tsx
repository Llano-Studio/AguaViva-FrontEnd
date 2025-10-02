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

  const firstLoad = useRef(true);

  // Normaliza las órdenes (regulares + one-off) para mostrarlas en la tabla
  const mappedOrders = useMemo(() => mapOrdersForTable(orders as any), [orders]);

  useEffect(() => {
    fetchVehicles();
    fetchOrders(orderSearch, selectedZoneId, {
      deliveryDateFrom: selectedDate,
      deliveryDateTo: selectedDate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando cambian las órdenes, seleccionarlas por defecto
  useEffect(() => {
    if (orders.length > 0) {
      setSelectedOrders(orders.map((order) => (order as any).id));
    } else {
      setSelectedOrders([]);
    }
  }, [orders, setSelectedOrders]);

  useEffect(() => {
    if (!firstLoad.current) {
      fetchOrders(orderSearch, selectedZoneId, {
        deliveryDateFrom: selectedDate,
        deliveryDateTo: selectedDate,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderSearch, selectedDate]);

  useEffect(() => {
    fetchOrders(orderSearch, selectedZoneId, {
      deliveryDateFrom: selectedDate,
      deliveryDateTo: selectedDate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

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

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDriverId = Number(e.target.value);
    setSelectedDriverId(newDriverId);
    setIsDriverAutoSelected(false);
  };

  useEffect(() => {
    setFormattedDate(formatDate(selectedDate));
  }, [selectedDate]);

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
          // ONE_OFF: solo one_off_purchase_id (+ header si aplica)
          const purchaseId = order?.purchase_id ?? order?.one_off_purchase_id;
          if (purchaseId) detail.one_off_purchase_id = Number(purchaseId);
          if (order?.one_off_purchase_header_id)
            detail.one_off_purchase_header_id = Number(order.one_off_purchase_header_id);
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
            onChange={setSelectedDate}
            className={className}
          />

          <select
            value={selectedVehicleId}
            onChange={(e) => {
              setSelectedVehicleId(Number(e.target.value));
              setIsDriverAutoSelected(true);
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
        <DataTable<any>
          data={mappedOrders}
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