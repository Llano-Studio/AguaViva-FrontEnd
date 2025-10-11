import React from "react";
import ReactDOM from "react-dom";
import '../../styles/css/components/common/modalCancelledConfirm.css'

interface ModalDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  content: string; // Ej: "usuario", "zona", "pedido"
  genere: "M" | "F"; // "M" para masculino, "F" para femenino
}

const ModalCancelledConfirm: React.FC<ModalDeleteConfirmProps> = ({
  isOpen,
  onClose,
  onDelete,
  content,
  genere,
}) => {
  if (!isOpen) return null;

  const articulo = genere === "M" ? "este" : "esta";
  const cancelar = `cancelar ${content}`;

  return ReactDOM.createPortal(
    <div className="modalCancelledConfirm-container">
      <div className="modalCancelledConfirm">
        <p className="modalCancelledConfirm-legend-1">
          ¿Quieres cancelar {articulo} {content}?
        </p>
        <p className="modalCancelledConfirm-legend-2">
          Al cancelar {articulo} {content} se perderán los datos ingresados
        </p>
        <div className="modalCancelledConfirm-actions">
          <button
            onClick={onClose}
            className="modalCancelledConfirm-button-cancel"
          >
            volver
          </button>
          <button
            onClick={onDelete}
            className="modalCancelledConfirm-button-delete"
          >
            {cancelar}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalCancelledConfirm;