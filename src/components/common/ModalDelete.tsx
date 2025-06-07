import React from "react";
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

  return (
    <div className="modal-delete-container">
      <div className="modal-delete">
        <p className="modal-delete-legend-1">
          ¿Quieres eliminar {articulo} {content}?
        </p>
        <p className="modal-delete-legend-2">
          Al eliminar {articulo} {content} se perderán los datos ingresados
        </p>
        <div className="modal-delete-actions">
          <button
            onClick={onClose}
            className="modal-delete-button-cancel"
          >
            Cancelar
          </button>
          <button
            onClick={onDelete}
            className="modal-delete-button-delete"
          >
            {eliminar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDelete;