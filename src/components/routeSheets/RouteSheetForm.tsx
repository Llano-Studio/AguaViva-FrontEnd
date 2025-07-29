import React, { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ItemForm } from "../common/ItemForm";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { routeSheetFields ,routeSheetDetailFields } from "../../config/routeSheets/routeSheetFieldsConfig";
import { CreateRouteSheetDTO } from "../../interfaces/RouteSheet";

interface RouteSheetFormProps {
  driverOptions: { label: string; value: number }[];
  vehicleOptions: { label: string; value: number }[];
  orderOptions: { label: string; value: number }[];
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  routeSheetToEdit?: any;
  loading?: boolean;
  error?: string | null;
  className?: string;
  onSuccess?: (msg: string) => void;
}

const getInitialValues = (isEditing: boolean, routeSheetToEdit?: any): CreateRouteSheetDTO => {
  if (isEditing && routeSheetToEdit) {
    return {
      driver_id: routeSheetToEdit.driver?.id ?? 0,
      vehicle_id: routeSheetToEdit.vehicle?.vehicle_id ?? 0,
      delivery_date: routeSheetToEdit.delivery_date ?? "",
      route_notes: routeSheetToEdit.route_notes ?? "",
      details: routeSheetToEdit.details?.map((d: any) => ({
        order_id: d.order?.order_id ?? 0,
        delivery_status: d.delivery_status ?? "PENDING",
        delivery_time: d.delivery_time ?? "",
        comments: d.comments ?? "",
        route_sheet_detail_id: d.route_sheet_detail_id,
      })) ?? [],
    };
  }
  return {
    driver_id: 0,
    vehicle_id: 0,
    delivery_date: "",
    route_notes: "",
    details: [],
  };
};

const RouteSheetForm: React.FC<RouteSheetFormProps> = ({
  driverOptions,
  vehicleOptions,
  orderOptions,
  onSubmit,
  onCancel,
  isEditing = false,
  routeSheetToEdit,
  loading,
  error,
  className,
  onSuccess,
}) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateRouteSheetDTO | null>(null);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, routeSheetToEdit),
    [isEditing, routeSheetToEdit]
  );

  // Set options dinámicamente
  routeSheetFields[0].options = driverOptions;
  routeSheetFields[1].options = vehicleOptions;
  routeSheetDetailFields[0].options = orderOptions;

  const form = useForm<CreateRouteSheetDTO>({
    defaultValues: initialValues
  });

  const { control, watch, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  useEffect(() => {
    if (fields.length === 0) {
        append({
        order_id: 0,
        delivery_status: "PENDING",
        delivery_time: "",
        comments: "",
        });
    }
    // eslint-disable-next-line
    }, []);

  // Submit handler
  const handleSubmit = async (values: CreateRouteSheetDTO | FormData) => {
    if (isEditing && routeSheetToEdit) {
      setPendingValues(values as CreateRouteSheetDTO);
      setShowUpdateConfirm(true);
      return;
    }
    try {
      let dataToSend: any = values;
      if (!(values instanceof FormData)) {
        dataToSend = { ...values };
      }
      await onSubmit(dataToSend);
      if (onSuccess) onSuccess("Hoja de ruta creada correctamente.");
    } catch (err: any) {
      setFormError(err?.message || "Error al guardar la hoja de ruta");
    }
  };

  // Confirmación de edición
  const handleConfirmUpdate = async () => {
    if (!pendingValues || !routeSheetToEdit) return;
    try {
      let dataToSend: any = pendingValues;
      if (!(pendingValues instanceof FormData)) {
        dataToSend = { ...pendingValues };
      }
      await onSubmit(dataToSend);
      if (onSuccess) onSuccess("Hoja de ruta editada correctamente.");
      setShowUpdateConfirm(false);
      setPendingValues(null);
    } catch (err: any) {
      setFormError(err?.message || "Error al actualizar la hoja de ruta");
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      <ItemForm<CreateRouteSheetDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={routeSheetFields}
        class={className}
      />

      <h3>Detalles de la hoja de ruta</h3>
        {fields.map((item, idx) => (
        <div key={item.id} className="route-sheet-detail">
            <ItemForm<any>
            {...form}
            fields={routeSheetDetailFields.map(field => ({
                ...field,
                name: `details.${idx}.${String(field.name)}`,
            }))}
            class="route-sheet-detail-form"
            onSubmit={() => {}} // <-- función vacía para cumplir con la interfaz
            />
            <button type="button" onClick={() => remove(idx)}>
            Eliminar detalle
            </button>
        </div>
        ))}
        <button type="button" onClick={() => append({
        order_id: 0,
        delivery_status: "PENDING",
        delivery_time: "",
        comments: "",
        })}>
        Agregar detalle
        </button>

      {(formError || error) && <div className="error-message">{formError || error}</div>}
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {isEditing ? "Guardar cambios" : "Guardar hoja de ruta"}
        </button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>

      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="hoja de ruta"
        genere="F"
      />
    </>
  );
};

export default RouteSheetForm;