import React from "react";
import ReactDOM from "react-dom";
import ClientComodatoForm from "./ClientComodatoForm";
import "../../styles/css/components/clients/modalClientComodato.css";

interface ModalClientComodatoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<any> | any;
  initialValues?: any;
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
}

const ModalClientComodato: React.FC<ModalClientComodatoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  loading,
  error,
  isEditing,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-container modalClientComodato-container">
      <div className="modal-wrapper modalClientComodato-wrapper">
        <div className="modal-header modal-header">
          <h2 className="modalClientComodato-title">
            {isEditing ? "Editar comodato" : "Agregar comodato"}
          </h2>
          <button onClick={onClose} className={`modalClientComodato-button-close`}>
            <img
              src="/assets/icons/filter-close.svg"
              alt="Cerrar"
              className="modal-icon-close"
              style={{ display: "inline-block" }}
            />
          </button>
        </div>
        <ClientComodatoForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
          error={error}
          isEditing={isEditing}
        />
      </div>
    </div>,
    document.body
  );
};

export default ModalClientComodato;