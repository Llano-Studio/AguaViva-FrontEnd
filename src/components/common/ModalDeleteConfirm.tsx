import React from "react";
import ReactDOM from "react-dom";
import '../../styles/css/components/common/modalDeleteConfirm.css'

interface ModalDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  content: string; // Ej: "usuario", "zona", "pedido"
  genere: "M" | "F"; // "M" para masculino, "F" para femenino
}

const ModalDeleteConfirm: React.FC<ModalDeleteConfirmProps> = ({
  isOpen,
  onClose,
  onDelete,
  content,
  genere,
}) => {
  if (!isOpen) return null;

  const articulo = genere === "M" ? "este" : "esta";
  const eliminar = `eliminar ${content}`;

  return ReactDOM.createPortal(
    <div className="modalDeleteConfirm-container">
      <div className="modalDeleteConfirm">
        <p className="modalDeleteConfirm-legend-1">
          ¿Quieres eliminar {articulo} {content}?
        </p>
        <p className="modalDeleteConfirm-legend-2">
          Al eliminar {articulo} {content} se perderán los datos ingresados
        </p>
        <div className="modalDeleteConfirm-actions">
          <button
            onClick={onClose}
            className="modalDeleteConfirm-button-cancel"
          >
            Cancelar
          </button>
          <button
            onClick={onDelete}
            className="modalDeleteConfirm-button-delete"
          >
            {eliminar}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalDeleteConfirm;