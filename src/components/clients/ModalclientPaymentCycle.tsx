import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { DataTable } from "../common/DataTable";
import { ItemForm } from "../common/ItemForm";
import { clientPaymentColumns } from "../../config/clients/clientPaymentColumns";
import { clientPaymentFormFields } from "../../config/clients/clientPaymentFormFields";
import usePaymentSubscription from "../../hooks/usePaymentSubscription";
import { formatDateTimeLocal } from "../../utils/formatDateTimeLocal";
import { RegisterPaymentDTO } from "../../interfaces/PaymentSubscription";
import ModalPaymentConfirm from "../common/ModalPaymentConfirm";
import { formatDateForView } from "../../utils/formateDateForView"; // <- agregar
import "../../styles/css/components/clients/modalClientPaymentCycle.css";


interface ModalclientPaymentCycleProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: any | null; // SubscriptionCyclesRow
  onChange?: () => void; 
}

type RegisterPaymentFormValues = {
  amount: number;
  payment_method: string;
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
  const { fetchCyclePayments, registerPayment, isLoading, error } = usePaymentSubscription();
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);

  // Confirmación
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDTO, setPendingDTO] = useState<RegisterPaymentDTO | null>(null);

  // React Hook Form para el ItemForm
  const form = useForm<RegisterPaymentFormValues>({
    defaultValues: {
      amount: (cycle?.pending_balance as any) ?? (undefined as any),
      payment_method: "EFECTIVO",
      payment_date: formatDateTimeLocal(new Date()),
      reference: "",
      notes: "",
    },
  });

  // Estado de pago del ciclo para decidir si se puede registrar pago
  const paymentStatus = summary?.payment_status ?? cycle?.payment_status;
  const canRegisterPayment = paymentStatus !== "PAID";

  // Reset defaults cuando se abre el modal o cambia el ciclo (usa pending_balance del ciclo)
  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      amount: (cycle?.pending_balance as any) ?? (undefined as any),
      payment_method: "EFECTIVO",
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
          payment_method: "EFECTIVO",
          payment_date: formatDateTimeLocal(new Date()),
          reference: "",
          notes: "",
        });
      } catch {
        if (!cancelled) {
          setSummary(null);
          setPayments([]);
          // Sin resumen, intentar usar el pending del ciclo si existe
          form.reset({
            amount: (cycle?.pending_balance as any) ?? (undefined as any),
            payment_method: "EFECTIVO",
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

  // Pre-submit: abrir confirmación
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

      // refrescar pagos y resumen del ciclo luego de registrar
      const res: any = await fetchCyclePayments(cycle.cycle_id);
      setSummary(res || null);
      setPayments((res?.payments || []).map((p: any) => ({ ...p, id: p.payment_id })));

      // reset del formulario con amount = nuevo pending_balance
      form.reset({
        amount: (res?.pending_balance as any) ?? (0 as any),
        payment_method: pendingDTO.payment_method || "EFECTIVO",
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

  return ReactDOM.createPortal(
    <div className="modal-container clientPaymentCycle-container">
      <div className="modal-wrapper clientPaymentCycle-wrapper">
        <div className="modal-header clientPaymentCycle-header">
          <h2 className="modal-title clientPaymentCycle-title">
            Pagos del Ciclo {cycle?.cycle_start ? formatDateForView(cycle.cycle_start) : "-"} - {cycle?.cycle_end ? formatDateForView(cycle.cycle_end) : "-"}
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
                />
              )}

              {canRegisterPayment && (
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

      {/* Modal de confirmación */}
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
    </div>,
    document.body
  );
};

export default ModalclientPaymentCycle;