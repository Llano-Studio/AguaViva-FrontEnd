import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { DataTable } from "../common/DataTable";
import { ItemForm } from "../common/ItemForm";
import { orderPaymentColumns } from "../../config/orders/orderPaymentColumnsConfig";
import { orderPaymentFormFields, orderPaymentFormFieldsEdit } from "../../config/orders/orderPaymentFormFieldsConfig";
import useOrders from "../../hooks/useOrders";
import useOrdersOneOff from "../../hooks/useOrdersOneOff";
import { formatDateTimeLocal } from "../../utils/formatDateTimeLocal";
import { CreateOrderPaymentDTO } from "../../interfaces/Order";
import ModalPaymentConfirm from "../common/ModalPaymentConfirm";
import Snackbar from "../common/Snackbar";
import "../../styles/css/components/orders/ModalOrderPayment.css";
import { renderStatusPaymentOrderLabel } from "../../utils/statusPaymentOrderLabels";
import { useAuth } from "../../hooks/useAuth";
import ModalDeleteConfirm from "../common/ModalDeleteConfirm";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import type { PaymentMethodOption } from "../../interfaces/PaymentMethod";

interface ModalOrderPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null; // Order | OrderOneOff
  paymentMethods?: PaymentMethodOption[];
  onChange?: () => void; // para recargar OrdersTable
}

type OrderPaymentFormValues = {
  amount: number;
  payment_method_id: number;
  payment_date: string; // datetime-local
  transaction_reference?: string;
  notes?: string;
};

type PaymentEditFormValues = {
  amount: number;
  payment_method: string; // EFECTIVO, TRANSFERENCIA, etc.
  payment_date: string; // datetime-local
  reference?: string;
  notes?: string;
};

const getNumeric = (v: any, def = 0) => {
  const n = parseFloat(String(v ?? def));
  return isNaN(n) ? def : n;
};

const ModalOrderPayment: React.FC<ModalOrderPaymentProps> = ({
  isOpen,
  onClose,
  order,
  paymentMethods = [],
  onChange,
}) => {
  const {
    processOrderPayment,
    fetchOrderById: fetchHybridById,
    isLoading: loadingRegular,
    error: errorRegular,
    updateOrderPayment,
    deleteOrderPayment,
  } = useOrders();
  const {
    processOneOffOrderPayment,
    fetchOrderById: fetchOneOffById,
    isLoading: loadingOneOff,
    error: errorOneOff,
  } = useOrdersOneOff();

  const { currentUser } = useAuth();
  const role = currentUser?.role?.toUpperCase?.() || "";
  const canEditPayment = role === "SUPERADMIN" || role === "BOSSADMINISTRATIVE";
  const canDeletePayment = role === "SUPERADMIN" || role === "BOSSADMINISTRATIVE";

  const isHybrid = order?.order_type === "HYBRID";
  const isOneOff = order?.order_type === "ONE_OFF";

  const isLoading = loadingRegular || loadingOneOff;
  const error = errorRegular || errorOneOff || null;

  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);

  // Confirmación crear pago
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDTO, setPendingDTO] = useState<CreateOrderPaymentDTO | null>(null);

  // Edición de pago
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const editForm = useForm<PaymentEditFormValues>({
    defaultValues: {
      amount: 0 as any,
      payment_method: "",
      payment_date: formatDateTimeLocal(new Date()),
      reference: "",
      notes: "",
    },
  });
  // Confirmación actualización (PUT)
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingEditValues, setPendingEditValues] = useState<PaymentEditFormValues | null>(null);

  // Confirmación eliminación (DELETE)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any | null>(null);

  // Snackbar
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // Helper: obtener el transactionId (payment_id | id | transaction_id) de fila o id directo
  const getTransactionId = (rowOrId: any): number => {
    if (typeof rowOrId === "number" || typeof rowOrId === "string") {
      const n = typeof rowOrId === "string" ? parseInt(rowOrId, 10) : rowOrId;
      return Number.isNaN(Number(n)) ? NaN : Number(n);
    }
    const raw = rowOrId?.payment_id ?? rowOrId?.id ?? rowOrId?.transaction_id;
    const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
    return Number.isNaN(n) ? NaN : n;
  };

  // Helper: normaliza el valor del método de pago a su key (EFECTIVO, TRANSFERENCIA, etc.)
  const normalizePaymentMethodKey = (raw: string): string => {
    if (!raw) return "";
    const byKey = paymentMethods.find((m) => m.key === raw)?.key;
    if (byKey) return byKey;
    const byLabel = paymentMethods.find(
      (m) => m.label.toLowerCase() === String(raw).toLowerCase()
    )?.key;
    return byLabel ?? "";
  };

  // Valores iniciales de resumen
  const initialSummary = useMemo(() => {
    if (!order) return null;
    const total_amount = order.total_amount ?? "0";
    const paid_amount = order.paid_amount ?? "0";
    const remaining_amount =
      order.remaining_amount ?? `${getNumeric(total_amount) - getNumeric(paid_amount)}`;
    const payment_status = order.payment_status ?? "PENDING";
    return { total_amount, paid_amount, remaining_amount, payment_status };
  }, [order]);

  // React Hook Form (crear pago)
  const form = useForm<OrderPaymentFormValues>({
    defaultValues: {
      amount: getNumeric(
        order?.remaining_amount ??
          (getNumeric(order?.total_amount) - getNumeric(order?.paid_amount)),
        0
      ) as any,
      payment_method_id: paymentMethods?.[0]?.value ?? (undefined as any),
      payment_date: formatDateTimeLocal(new Date()),
      transaction_reference: "",
      notes: "",
    },
  });

  // Mostrar formulario solo si NO está pago
  const paymentStatus = summary?.payment_status ?? order?.payment_status;
  const canRegisterPayment = paymentStatus !== "PAID";

  // Reset al abrir/cambiar orden
  useEffect(() => {
    if (!isOpen || !order) return;
    const amountDefault = getNumeric(
      order?.remaining_amount ??
        (getNumeric(order?.total_amount) - getNumeric(order?.paid_amount)),
      0
    );
    form.reset({
      amount: amountDefault as any,
      payment_method_id: paymentMethods?.[0]?.value ?? (undefined as any),
      payment_date: formatDateTimeLocal(new Date()),
      transaction_reference: "",
      notes: "",
    });

    setPayments((order?.payments ?? []).map((p: any) => ({ ...p, id: p.payment_id })));
    setSummary(initialSummary);
    setEditingPayment(null);
    setShowUpdateConfirm(false);
    setPendingEditValues(null);
    setShowDeleteConfirm(false);
    setPaymentToDelete(null);
  }, [isOpen, order, paymentMethods, form, initialSummary]);

  if (!isOpen) return null;

  // Pre-submit crear: abrir confirmación
  const handlePreSubmitPayment = async (values: OrderPaymentFormValues | FormData) => {
    if (!order) return;
    const v = values as OrderPaymentFormValues;
    const dto: CreateOrderPaymentDTO = {
      payment_method_id: Number(v.payment_method_id),
      amount: Number(v.amount),
      payment_date: new Date(v.payment_date).toISOString(),
      transaction_reference: v.transaction_reference || undefined,
      notes: v.notes || undefined,
    };
    setPendingDTO(dto);
    setShowConfirm(true);
  };

  // Confirmar y registrar pago
  const handleConfirmPayment = async () => {
    if (!pendingDTO || !order) return;
    try {
      const type = String(order.order_type || "").toUpperCase();
      if (type === "HYBRID") {
        await processOrderPayment(order.order_id, pendingDTO);
        const refreshed = await fetchHybridById(order.order_id);
        if (refreshed) {
          setPayments((refreshed.payments ?? []).map((p: any) => ({ ...p, id: p.payment_id })));
          setSummary({
            total_amount: refreshed.total_amount,
            paid_amount: refreshed.paid_amount,
            remaining_amount: refreshed.remaining_amount,
            payment_status: refreshed.payment_status,
          });
          form.reset({
            amount: getNumeric(refreshed.remaining_amount, 0) as any,
            payment_method_id: pendingDTO.payment_method_id,
            payment_date: formatDateTimeLocal(new Date()),
            transaction_reference: "",
            notes: "",
          });
        }
      } else if (type === "ONE_OFF") {
        await processOneOffOrderPayment(order.purchase_id, pendingDTO);
        const refreshed = await fetchOneOffById(order.purchase_id);
        if (refreshed) {
          setPayments((refreshed.payments ?? []).map((p: any) => ({ ...p, id: p.payment_id })));
          setSummary({
            total_amount: refreshed.total_amount,
            paid_amount: refreshed.paid_amount,
            remaining_amount: refreshed.remaining_amount,
            payment_status: refreshed.payment_status,
          });
          form.reset({
            amount: getNumeric(refreshed.remaining_amount, 0) as any,
            payment_method_id: pendingDTO.payment_method_id,
            payment_date: formatDateTimeLocal(new Date()),
            transaction_reference: "",
            notes: "",
          });
        }
      } else {
        setSnackMsg("Tipo de pedido desconocido para registrar el pago: " + type);
        setSnackOpen(true);
        return;
      }

      setSnackMsg("Pago registrado correctamente");
      setSnackOpen(true);
      if (typeof onChange === "function") onChange();
    } catch (e) {
      console.error("Error al registrar pago:", e);
      setSnackMsg("Error al registrar pago");
      setSnackOpen(true);
    } finally {
      setShowConfirm(false);
      setPendingDTO(null);
    }
  };

  // Iniciar edición de un pago
  const handleStartEditPayment = (row: any) => {
    setEditingPayment(row);
    editForm.reset({
      amount: Number(row?.amount ?? 0) as any,
      payment_method: normalizePaymentMethodKey(String(row?.payment_method ?? "")),
      payment_date: row?.payment_date
        ? formatDateTimeLocal(new Date(row.payment_date))
        : formatDateTimeLocal(new Date()),
      reference: row?.reference ?? row?.transaction_reference ?? "",
      notes: row?.notes ?? "",
    });
  };

  // Adaptador onSubmit edición (ItemForm admite FormData | T)
  const handlePreSubmitEditPayment = (values: PaymentEditFormValues | FormData) => {
    const v = values as PaymentEditFormValues;
    setPendingEditValues(v);
    setShowUpdateConfirm(true);
  };

  // Guardar edición (PUT /orders/payments/{transactionId})
  const handleSubmitEditPayment = async (values: PaymentEditFormValues) => {
    try {
      if (!editingPayment) return;

      const transactionId = getTransactionId(editingPayment);
      if (Number.isNaN(transactionId)) {
        console.error("No se pudo determinar el transactionId del pago a actualizar", editingPayment);
        setSnackMsg("No se pudo identificar el pago a actualizar");
        setSnackOpen(true);
        return;
      }

      const v = values;
      const dto = {
        amount: String(v.amount),
        reference: v.reference || undefined,
        payment_method: v.payment_method, // key (EFECTIVO, etc.)
        payment_date: new Date(v.payment_date).toISOString(),
        notes: v.notes || undefined,
      };
      await updateOrderPayment(transactionId, dto);

      const type = String(order?.order_type || "").toUpperCase();
      if (type === "HYBRID") {
        const refreshed = await fetchHybridById(order!.order_id);
        if (refreshed) {
          setPayments((refreshed.payments ?? []).map((p: any) => ({ ...p, id: p.payment_id })));
          setSummary({
            total_amount: refreshed.total_amount,
            paid_amount: refreshed.paid_amount,
            remaining_amount: refreshed.remaining_amount,
            payment_status: refreshed.payment_status,
          });
        }
      } else if (type === "ONE_OFF") {
        const refreshed = await fetchOneOffById(order!.purchase_id);
        if (refreshed) {
          setPayments((refreshed.payments ?? []).map((p: any) => ({ ...p, id: p.payment_id })));
          setSummary({
            total_amount: refreshed.total_amount,
            paid_amount: refreshed.paid_amount,
            remaining_amount: refreshed.remaining_amount,
            payment_status: refreshed.payment_status,
          });
        }
      }

      setSnackMsg("Pago actualizado correctamente");
      setSnackOpen(true);
      setEditingPayment(null);
      if (typeof onChange === "function") onChange();
    } catch (e) {
      console.error("Error al actualizar pago:", e);
      setSnackMsg("Error al actualizar pago");
      setSnackOpen(true);
    } finally {
      setShowUpdateConfirm(false);
      setPendingEditValues(null);
    }
  };

  // Eliminar pago (DELETE /orders/payments/{transactionId})
  const handleDeletePayment = async (row: any) => {
    try {
      const transactionId = getTransactionId(row);
      if (Number.isNaN(transactionId)) {
        console.error("No se pudo determinar el transactionId del pago a eliminar", row);
        setSnackMsg("No se pudo identificar el pago a eliminar");
        setSnackOpen(true);
        return;
      }

      await deleteOrderPayment(transactionId);

      const type = String(order?.order_type || "").toUpperCase();
      if (type === "HYBRID") {
        const refreshed = await fetchHybridById(order!.order_id);
        if (refreshed) {
          setPayments((refreshed.payments ?? []).map((p: any) => ({ ...p, id: p.payment_id })));
          setSummary({
            total_amount: refreshed.total_amount,
            paid_amount: refreshed.paid_amount,
            remaining_amount: refreshed.remaining_amount,
            payment_status: refreshed.payment_status,
          });
        }
      } else if (type === "ONE_OFF") {
        const refreshed = await fetchOneOffById(order!.purchase_id);
        if (refreshed) {
          setPayments((refreshed.payments ?? []).map((p: any) => ({ ...p, id: p.payment_id })));
          setSummary({
            total_amount: refreshed.total_amount,
            paid_amount: refreshed.paid_amount,
            remaining_amount: refreshed.remaining_amount,
            payment_status: refreshed.payment_status,
          });
        }
      }

      setSnackMsg("Pago eliminado correctamente");
      setSnackOpen(true);
      if (typeof onChange === "function") onChange();
    } catch (e) {
      console.error("Error al eliminar pago:", e);
      setSnackMsg("Error al eliminar pago");
      setSnackOpen(true);
    } finally {
      setShowDeleteConfirm(false);
      setPaymentToDelete(null);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-container orderPayment-container">
      <div className="modal-wrapper orderPayment-wrapper">
        <div className="modal-header orderPayment-header">
          <h2 className="modal-title orderPayment-title">
            Pagos de la Orden {isHybrid ? `#${order?.order_id}` : isOneOff ? `#${order?.purchase_id}` : ""}
          </h2>
          <button onClick={onClose} className="modal-close-button orderPayment-close">
            <img
              src="/assets/icons/filter-close.svg"
              alt="Cerrar"
              className="modal-icon-cancel orderPayment-icon-cancel"
            />
          </button>
        </div>

        <div className="modal-content orderPayment-content">
          {isLoading ? (
            <div className="p-4">Cargando pagos...</div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <>
              {payments.length > 0 && (
                <DataTable
                  data={payments}
                  columns={orderPaymentColumns}
                  class="orderPayment"
                  onEdit={canEditPayment ? handleStartEditPayment : undefined}
                  onDelete={
                    canDeletePayment
                      ? (row: any) => {
                          setPaymentToDelete(row);
                          setShowDeleteConfirm(true);
                        }
                      : undefined
                  }
                />
              )}

              {canEditPayment && editingPayment && (
                <div className="orderPayment-edit" style={{ marginTop: 12 }}>
                  <h3 className="orderPayment-modal-subtitle">Editar pago</h3>
                  <ItemForm<PaymentEditFormValues>
                    {...editForm}
                    onSubmit={handlePreSubmitEditPayment}
                    class="orderPayment"
                    hideActions
                    fields={
                      orderPaymentFormFieldsEdit(
                        (paymentMethods || []).map((m) => ({ label: m.label, value: m.key }))
                      ) as any
                    }
                    renderInputs={() => (
                      <div className="orderPayment-actions" style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          className="form-cancel orderPayment-form-cancel"
                          onClick={() => setEditingPayment(null)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="form-submit orderPayment-form-submit"
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

              {/* Ocultar el formulario de registrar pago cuando se está editando */}
              {canRegisterPayment && !editingPayment && (
                <div className="orderPayment-summary">
                  <h3 className="orderPayment-modal-subtitle">Registrar pago</h3>
                  {summary && (
                    <div className="orderPayment-summary-data" style={{ marginTop: payments.length > 0 ? 12 : 0 }}>
                      <div>Saldo Pendiente: ${summary?.remaining_amount ?? 0}</div>
                      <div>Total: ${summary?.total_amount ?? order?.total_amount ?? "-"}</div>
                      <div>Pagado: ${summary?.paid_amount ?? order?.paid_amount ?? 0}</div>
                      <div>Estado: {renderStatusPaymentOrderLabel(String(summary?.payment_status ?? "NONE"))}</div>
                    </div>
                  )}
                  <ItemForm<OrderPaymentFormValues>
                    {...form}
                    onSubmit={handlePreSubmitPayment}
                    fields={orderPaymentFormFields(paymentMethods)}
                    class="orderPayment"
                    hideActions
                    renderInputs={() => (
                      <div className="orderPayment-actions">
                        <button
                          type="submit"
                          className="form-submit orderPayment-form-submit"
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

      {/* Confirmación para crear pago */}
      <ModalPaymentConfirm
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setPendingDTO(null);
        }}
        onConfirm={handleConfirmPayment}
        amount={Number(pendingDTO?.amount || 0)}
        payment_method={
          paymentMethods.find((m) => m.value === pendingDTO?.payment_method_id)?.label || ""
        }
        payment_date={pendingDTO?.payment_date || new Date().toISOString()}
        reference={pendingDTO?.transaction_reference}
        loading={isLoading}
      />

      {/* Confirmación para actualizar pago */}
      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => {
          setShowUpdateConfirm(false);
          setPendingEditValues(null);
        }}
        onConfirm={() => {
          if (pendingEditValues) handleSubmitEditPayment(pendingEditValues);
        }}
        content="pago"
        genere="M"
      />

      {/* Confirmación para eliminar pago */}
      <ModalDeleteConfirm
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPaymentToDelete(null);
        }}
        onDelete={() => {
          if (paymentToDelete) handleDeletePayment(paymentToDelete);
        }}
        content="pago"
        genere="M"
      />

      <Snackbar open={snackOpen} message={snackMsg} onClose={() => setSnackOpen(false)} />
    </div>,
    document.body
  );
};

export default ModalOrderPayment;