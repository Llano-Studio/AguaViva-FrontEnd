import React from "react";
import ReactDOM from "react-dom";
import { formatDateTimeForView } from "../../utils/formatDateTimeForView";
import { getPaymentMethodLabelByKey } from "../../utils/paymentMethods";
import "../../styles/css/components/common/modalPaymentConfirm.css";

interface ModalPaymentConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  payment_method: string;
  payment_date: string; // ISO o datetime-local
  reference?: string;
  loading?: boolean;
}

const ModalPaymentConfirm: React.FC<ModalPaymentConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  amount,
  payment_method,
  payment_date,
  reference,
  loading = false,
}) => {
  if (!isOpen) return null;

  const dateForView = (() => {
    try {
      return formatDateTimeForView(payment_date);
    } catch {
      return payment_date;
    }
  })();

  return ReactDOM.createPortal(
    <div className="modalPaymentConfirm-container">
      <div className="modalPaymentConfirm">
        <p className="modalPaymentConfirm-legend-1">
          ¿Confirmar pago de ${amount}?
        </p>
        <p className="modalPaymentConfirm-legend-2">
          Método: {getPaymentMethodLabelByKey(payment_method)} • Fecha y hora: {dateForView}
          {reference ? ` • Referencia: ${reference}` : ""}
        </p>
        <div className="modalPaymentConfirm-actions">
          <button
            onClick={onClose}
            className="modalPaymentConfirm-button-cancel"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="modalPaymentConfirm-button-confirm"
            disabled={loading}
          >
            {loading ? "Generando..." : "Confirmar pago"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalPaymentConfirm;
