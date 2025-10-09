import React from "react";
import ReactDOM from "react-dom";
import "../../styles/css/components/common/ModalActionConfirm.css";

interface ModalActionConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  content: string;
}

const ModalActionConfirm: React.FC<ModalActionConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  content,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modalActionConfirm-container">
      <div className="modalActionConfirm">
        <p className="modalActionConfirm-legend-1">
          ¿Quieres {content}?
        </p>
        <div className="modalActionConfirm-actions">
          <button onClick={onClose} className="modalActionConfirm-button-cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} className="modalActionConfirm-button-confirm">
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalActionConfirm;