import React from "react";
import ReactDOM from "react-dom";
import ClientCancelledSubscriptionForm from "./ClientCancelledSubscriptionForm";
import "../../styles/css/components/clients/modalCancelledSubscription.css";

interface ModalCancelledSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  loading?: boolean;
  error?: string | null;
}

const ModalCancelledSubscription: React.FC<ModalCancelledSubscriptionProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  loading,
  error,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-container modalCancelledSubscription-container">
      <div className="modal-wrapper modalCancelledSubscription-wrapper">
        <div className="modal-header">
          <h2 className="modalCancelledSubscription-title">Cancelar abono</h2>
          <button
            onClick={onClose}
            className="modalCancelledSubscription-button-close"
            type="button"
          >
            <img
              src="/assets/icons/filter-close.svg"
              alt="Cerrar"
              className="modal-icon-close"
              style={{ display: "inline-block" }}
            />
          </button>
        </div>
        <ClientCancelledSubscriptionForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
          error={error}
        />
      </div>
    </div>,
    document.body
  );
};

export default ModalCancelledSubscription;