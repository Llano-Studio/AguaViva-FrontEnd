import React from "react";
import ReactDOM from "react-dom";
import '../../styles/css/components/common/modalDelete.css'

interface ModalDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  content: string; // Ej: "usuario", "zona", "pedido"
  genere: "M" | "F"; // "M" para masculino, "F" para femenino
}

const ModalDelete: React.FC<ModalDeleteProps> = ({
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
    <div className="modalDelete-container">
      <div className="modalDelete">
        <p className="modalDelete-legend-1">
          ¿Quieres eliminar {articulo} {content}?
        </p>
        <p className="modalDelete-legend-2">
          Al eliminar {articulo} {content} se perderán los datos ingresados
        </p>
        <div className="modalDelete-actions">
          <button
            onClick={onClose}
            className="modalDelete-button-cancel"
          >
            Cancelar
          </button>
          <button
            onClick={onDelete}
            className="modalDelete-button-delete"
          >
            {eliminar}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalDelete;