import React from "react";
import ReactDOM from "react-dom";
import ClientSubscriptionForm from "./ClientSubscriptionForm";
import "../../styles/css/components/clients/modalSubscriptionClient.css";

interface ModalSubscriptionClientProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  plansOptions: { label: string; value: number }[];
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
}

const ModalSubscriptionClient: React.FC<ModalSubscriptionClientProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  plansOptions,
  loading,
  error,
  isEditing,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-container modalSubscriptionClient-container">
      <div className="modal-wrapper modalSubscriptionClient-wrapper">
        <div className="modal-header modal-header">
          <h2 className="modalSubscriptionClient-title">{isEditing ? "Editar abono" : "Agregar abono"}</h2>
          <button 
            onClick={onClose} className={`modalSubscriptionClient-button-close`}>
            <img
              src="/assets/icons/filter-close.svg"
              alt="Cerrar"
              className="modal-icon-close"
              style={{ display: "inline-block" }}
            />
          </button>
        </div>
        <ClientSubscriptionForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          plansOptions={plansOptions}
          loading={loading}
          error={error}
          isEditing={isEditing}
        />
      </div>
    </div>,
    document.body
  );
};

export default ModalSubscriptionClient;