import React from "react";
import ReactDOM from "react-dom";
import "../../styles/css/components/common/modalUpdateConfirm.css";

interface ModalUpdateConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  content: string;
  genere: "M" | "F";
}

const ModalUpdateConfirm: React.FC<ModalUpdateConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  content,
  genere,
}) => {
  if (!isOpen) return null;

  const articulo = genere === "M" ? "este" : "esta";

  return ReactDOM.createPortal(
    <div className="modalUpdateConfirm-container">
      <div className="modalUpdateConfirm">
        <p className="modalUpdateConfirm-legend-1">
          ¿Quieres actualizar {articulo} {content}?
        </p>
        <p className="modalUpdateConfirm-legend-2">
          Al actualizar {articulo} {content} se modificarán los datos actuales.
        </p>
        <div className="modalUpdateConfirm-actions">
          <button onClick={onClose} className="modalUpdateConfirm-button-cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} className="modalUpdateConfirm-button-confirm">
            Actualizar {content}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalUpdateConfirm;