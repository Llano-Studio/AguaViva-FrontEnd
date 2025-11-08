import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { DataTable } from "../common/DataTable";
import { ItemForm } from "../common/ItemForm";
import { clientPaymentColumns } from "../../config/clients/clientPaymentColumns";
import { clientPaymentFormFields, clientPaymentFormFieldsEdit } from "../../config/clients/clientPaymentFormFields";
import usePaymentSubscription from "../../hooks/usePaymentSubscription";
import { formatDateTimeLocal } from "../../utils/formatDateTimeLocal";
import { RegisterPaymentDTO } from "../../interfaces/PaymentSubscription";
import ModalPaymentConfirm from "../common/ModalPaymentConfirm";
import ModalDeleteConfirm from "../common/ModalDeleteConfirm";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { formatDateForView } from "../../utils/formateDateForView";
import "../../styles/css/components/clients/modalClientPaymentCycle.css";
import type { PaymentMethodKey } from "../../interfaces/PaymentMethod";
import { getPaymentMethodKeyOptions } from "../../utils/paymentMethods";
import { useAuth } from "../../hooks/useAuth";

interface ModalclientPaymentCycleProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: any | null; // SubscriptionCyclesRow
  onChange?: () => void;
}

type RegisterPaymentFormValues = {
  amount: number;
  payment_method: PaymentMethodKey;
  payment_date: string; // datetime-local
  reference?: string;
  notes?: string;
};

type PaymentCycleEditFormValues = {
  amount: number;
  payment_method: PaymentMethodKey;
  payment_date: string; // datetime-local
  reference?: string;
  notes?: string;
};

const ModalclientPaymentCycle: React.FC<ModalclientPaymentCycleProps> = ({
  isOpen,
  onClose,
  cycle,
  onChange,
}) => {
  const {
    fetchCyclePayments,
    registerPayment,
    updatePayment,
    deletePayment,
    isLoading,
    error,
  } = usePaymentSubscription();

  const { currentUser } = useAuth();
  const role = currentUser?.role?.toUpperCase?.() || "";
  const canEditPayment = role === "SUPERADMIN" || role === "BOSSADMINISTRATIVE";
  const canDeletePayment = role === "SUPERADMIN" || role === "BOSSADMINISTRATIVE";

  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);

  // Confirmación crear
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDTO, setPendingDTO] = useState<RegisterPaymentDTO | null>(null);

  // Confirmación actualizar
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingEditValues, setPendingEditValues] = useState<PaymentCycleEditFormValues | null>(null);

  // Confirmación eliminar
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any | null>(null);

  // Form crear
  const form = useForm<RegisterPaymentFormValues>({
    defaultValues: {
      amount: (cycle?.pending_balance as any) ?? (undefined as any),
      payment_method: "EFECTIVO" as PaymentMethodKey,
      payment_date: formatDateTimeLocal(new Date()),
      reference: "",
      notes: "",
    },
  });

  // Form editar
  const editForm = useForm<PaymentCycleEditFormValues>({
    defaultValues: {
      amount: 0 as any,
      payment_method: "EFECTIVO",
      payment_date: formatDateTimeLocal(new Date()),
      reference: "",
      notes: "",
    },
  });

  const paymentMethodKeyOptions = getPaymentMethodKeyOptions(); // [{label, value: key}]

  // Estado de pago del ciclo para decidir si se puede registrar pago
  const paymentStatus = summary?.payment_status ?? cycle?.payment_status;
  const canRegisterPayment = paymentStatus !== "PAID";

  // Reset defaults cuando se abre el modal o cambia el ciclo (usa pending_balance del ciclo)
  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      amount: (cycle?.pending_balance as any) ?? (undefined as any),
      payment_method: "EFECTIVO" as PaymentMethodKey,
      payment_date: formatDateTimeLocal(new Date()),
      reference: "",
      notes: "",
    });
  }, [isOpen, cycle, form]);

  // Cargar pagos y resumen del ciclo
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isOpen || !cycle?.cycle_id) return;
      try {
        const res: any = await fetchCyclePayments(cycle.cycle_id);
        if (cancelled) return;
        setSummary(res || null);
        setPayments((res?.payments || []).map((p: any) => ({ ...p, id: p.payment_id })));

        // Al recibir el resumen, setear amount por defecto = pending_balance
        form.reset({
          amount: (res?.pending_balance as any) ?? (cycle?.pending_balance as any) ?? (0 as any),
          payment_method: "EFECTIVO" as PaymentMethodKey,
          payment_date: formatDateTimeLocal(new Date()),
          reference: "",
          notes: "",
        });
      } catch {
        if (!cancelled) {
          setSummary(null);
          setPayments([]);
          form.reset({
            amount: (cycle?.pending_balance as any) ?? (undefined as any),
            payment_method: "EFECTIVO" as PaymentMethodKey,
            payment_date: formatDateTimeLocal(new Date()),
            reference: "",
            notes: "",
          });
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, cycle, fetchCyclePayments, form]);

  if (!isOpen) return null;

  // Helper: obtener el paymentId desde la fila o id directo
  const getPaymentId = (rowOrId: any): number => {
    if (typeof rowOrId === "number" || typeof rowOrId === "string") {
      const n = typeof rowOrId === "string" ? parseInt(rowOrId, 10) : rowOrId;
      return Number.isNaN(Number(n)) ? NaN : Number(n);
    }
    const raw = rowOrId?.payment_id ?? rowOrId?.id ?? rowOrId?.transaction_id;
    const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
    return Number.isNaN(n) ? NaN : n;
  };

  // Pre-submit: abrir confirmación (crear)
  const handlePreSubmitPayment = async (values: RegisterPaymentFormValues | FormData) => {
    if (!cycle?.cycle_id) return;
    const v = values as RegisterPaymentFormValues;
    const dto: RegisterPaymentDTO = {
      cycle_id: cycle.cycle_id,
      amount: Number(v.amount),
      payment_method: v.payment_method,
      payment_date: new Date(v.payment_date).toISOString(),
      reference: v.reference || undefined,
      notes: v.notes || undefined,
    };
    setPendingDTO(dto);
    setShowConfirm(true);
  };

  // Confirmar y registrar pago
  const handleConfirmPayment = async () => {
    if (!pendingDTO || !cycle?.cycle_id) return;
    try {
      await registerPayment(pendingDTO);

      const res: any = await fetchCyclePayments(cycle.cycle_id);
      setSummary(res || null);
      setPayments((res?.payments || []).map((p: any) => ({ ...p, id: p.payment_id })));

      form.reset({
        amount: (res?.pending_balance as any) ?? (0 as any),
        payment_method: (pendingDTO.payment_method || "EFECTIVO") as PaymentMethodKey,
        payment_date: formatDateTimeLocal(new Date()),
        reference: "",
        notes: "",
      });
      if (typeof onChange === "function") onChange();
    } catch (e) {
      console.error("Error al registrar pago:", e);
    } finally {
      setShowConfirm(false);
      setPendingDTO(null);
    }
  };

  // Iniciar edición: cargar valores al form
  const handleStartEditPayment = (row: any) => {
    editForm.reset({
      amount: Number(row?.amount ?? 0) as any,
      payment_method: (row?.payment_method as PaymentMethodKey) || "EFECTIVO",
      payment_date: row?.payment_date
        ? formatDateTimeLocal(new Date(row.payment_date))
        : formatDateTimeLocal(new Date()),
      reference: row?.reference ?? "",
      notes: row?.notes ?? "",
    });
    setPendingEditValues(null); // limpiar pending anterior
    // Guardamos la fila en un estado temporal reutilizando paymentToDelete para no crear otro
    setPaymentToDelete(row); // reutilizamos para tener la fila activa en edición
  };

  // Pre-submit edición: abrir confirmación
  const handlePreSubmitEditPayment = (values: PaymentCycleEditFormValues | FormData) => {
    const v = values as PaymentCycleEditFormValues;
    setPendingEditValues(v);
    setShowUpdateConfirm(true);
  };

  // Confirmar edición
  const handleConfirmEditPayment = async () => {
    if (!cycle?.cycle_id || !paymentToDelete || !pendingEditValues) return;
    const paymentId = getPaymentId(paymentToDelete);
    if (Number.isNaN(paymentId)) return;

    try {
      await updatePayment(paymentId, {
        amount: Number(pendingEditValues.amount),
        payment_method: pendingEditValues.payment_method,
        payment_date: new Date(pendingEditValues.payment_date).toISOString(),
        reference: pendingEditValues.reference || undefined,
        notes: pendingEditValues.notes || undefined,
      });

      const res: any = await fetchCyclePayments(cycle.cycle_id);
      setSummary(res || null);
      setPayments((res?.payments || []).map((p: any) => ({ ...p, id: p.payment_id })));

      setPaymentToDelete(null);
      setPendingEditValues(null);
      if (typeof onChange === "function") onChange();
    } catch (e) {
      console.error("Error al actualizar pago de ciclo:", e);
    } finally {
      setShowUpdateConfirm(false);
    }
  };

  // Eliminar pago (body opcional)
  const handleDeletePayment = async (row: any) => {
    setPaymentToDelete(row);
    setShowDeleteConfirm(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!cycle?.cycle_id || !paymentToDelete) return;
    const paymentId = getPaymentId(paymentToDelete);
    if (Number.isNaN(paymentId)) return;

    try {
      // body opcional (vacío)
      await deletePayment(paymentId, {});
      const res: any = await fetchCyclePayments(cycle.cycle_id);
      setSummary(res || null);
      setPayments((res?.payments || []).map((p: any) => ({ ...p, id: p.payment_id })));
      if (typeof onChange === "function") onChange();
    } catch (e) {
      console.error("Error al eliminar pago de ciclo:", e);
    } finally {
      setShowDeleteConfirm(false);
      setPaymentToDelete(null);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-container clientPaymentCycle-container">
      <div className="modal-wrapper clientPaymentCycle-wrapper">
        <div className="modal-header clientPaymentCycle-header">
          <h2 className="modal-title clientPaymentCycle-title">
            Pagos del Ciclo {cycle?.cycle_start ? formatDateForView(cycle.cycle_start) : "-"} -{" "}
            {cycle?.cycle_end ? formatDateForView(cycle.cycle_end) : "-"}
          </h2>
          <button onClick={onClose} className="modal-close-button clientPaymentCycle-close">
            <img
              src="/assets/icons/filter-close.svg"
              alt="Cerrar"
              className="modal-icon-cancel clientPaymentCycle-icon-cancel"
            />
          </button>
        </div>

        <div className="modal-content clientPaymentCycle-content">
          {isLoading ? (
            <div className="p-4">Cargando pagos...</div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <>
              {payments.length > 0 && (
                <DataTable
                  data={payments}
                  columns={clientPaymentColumns}
                  class="clientPaymentCycle"
                  onEdit={canEditPayment ? handleStartEditPayment : undefined}
                  onDelete={canDeletePayment ? handleDeletePayment : undefined}
                />
              )}

              {/* Form de edición cuando se seleccionó una fila para editar */}
              {canEditPayment && paymentToDelete && !showDeleteConfirm && (
                <div className="clientPaymentCycle-edit" style={{ marginTop: 12 }}>
                  <h3 className="clientPaymentCycle-modal-subtitle">Editar pago de ciclo</h3>
                  <ItemForm<PaymentCycleEditFormValues>
                    {...editForm}
                    onSubmit={handlePreSubmitEditPayment}
                    class="clientPaymentCycle"
                    hideActions
                    fields={clientPaymentFormFieldsEdit(paymentMethodKeyOptions) as any}
                    renderInputs={() => (
                      <div className="clientPaymentCycle-actions" style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          className="form-cancel clientPaymentCycle-form-cancel"
                          onClick={() => {
                            setPaymentToDelete(null);
                            setPendingEditValues(null);
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="form-submit clientPaymentCycle-form-submit"
                          disabled={isLoading}
                          style={{ marginLeft: 8 }}
                        >
                          {isLoading ? "Validando..." : "Guardar cambios"}
                        </button>
                      </div>
                    )}
                  />
                </div>
              )}

              {canRegisterPayment && !(paymentToDelete && !showDeleteConfirm) && (
                <div className="clientPaymentCycle-summary">
                  <h3 className="clientPaymentCycle-modal-subtitle">Registrar pago</h3>
                  <p className="clientPaymentCycle-modal-subtitle">
                    Saldo pendiente: {summary?.pending_balance ?? cycle?.pending_balance ?? 0}
                  </p>
                  <ItemForm<RegisterPaymentFormValues>
                    {...form}
                    onSubmit={handlePreSubmitPayment}
                    fields={clientPaymentFormFields}
                    class="clientPaymentCycle"
                    hideActions
                    renderInputs={() => (
                      <div className="clientPaymentCycle-actions">
                        <button
                          type="submit"
                          className="form-submit clientPaymentCycle-form-submit"
                          disabled={isLoading}
                        >
                          {isLoading ? "Generando..." : "Generar pago"}
                        </button>
                      </div>
                    )}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmación crear */}
      <ModalPaymentConfirm
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setPendingDTO(null);
        }}
        onConfirm={handleConfirmPayment}
        amount={Number(pendingDTO?.amount || 0)}
        payment_method={pendingDTO?.payment_method || ""}
        payment_date={pendingDTO?.payment_date || new Date().toISOString()}
        reference={pendingDTO?.reference}
        loading={isLoading}
      />

      {/* Confirmación actualizar */}
      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => {
          setShowUpdateConfirm(false);
          setPendingEditValues(null);
        }}
        onConfirm={handleConfirmEditPayment}
        content="pago"
        genere="M"
      />

      {/* Confirmación eliminar */}
      <ModalDeleteConfirm
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPaymentToDelete(null);
        }}
        onDelete={handleConfirmDelete}
        content="pago"
        genere="M"
      />
    </div>,
    document.body
  );
};

export default ModalclientPaymentCycle;