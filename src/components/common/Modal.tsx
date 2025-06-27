import React from "react";
import ReactDOM from "react-dom";
import "../../styles/css/components/common/modal.css";

interface ModalConfigItem {
  label: string;
  accessor: string;
  isImage?: boolean;
  render?: (value: any, data?: any) => React.ReactNode;
  className?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  class?: string;
  config?: ModalConfigItem[];
  data?: any;
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  class: classModal,
  config,
  data
}) => {
  if (!isOpen) return null;
  console.log("Modal data:", data);

  return ReactDOM.createPortal(
    <div className={`modal-container ${classModal ? classModal+"-modal-container" : ""}`}>
      <div className={`modal-wrapper ${classModal ? classModal+"-modal-wrapper" : ""}`}>
        <div className={`modal-header ${classModal ? classModal+"-modal-header" : ""}`}>
          <h2 className={`modal-title ${classModal ? classModal+"-modal-title" : ""}`}>{title}</h2>
          <button 
            onClick={onClose} className={`modal-button-close ${classModal ? classModal+"-modal-button-close" : ""}`}>
            <img
              src="/assets/icons/filter-close.svg"
              alt="Cerrar"
              className="modal-icon-close"
              style={{ display: "inline-block" }}
            />
          </button>
        </div>
        {config && data ? (
          <div className={`modal-content ${classModal ? classModal+"-modal-content" : ""}`}>
            {config.map((item) => (
              <div key={item.accessor} className={item.className ? `${classModal ? classModal+"-" : ""}${item.className}` : ""}>
                {item.label && (
                  <label className={`modal-label`}>{item.label}:</label>
                )}
                <p className={`modal-label-value`}>
                  {item.isImage && getNestedValue(data, item.accessor) ? (
                    <img
                      src={getNestedValue(data, item.accessor)}
                      alt={item.label || "Imagen"}
                      style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : item.render
                    ? item.render(getNestedValue(data, item.accessor), data)
                    : String(getNestedValue(data, item.accessor) ?? "")
                  }
                </p>
              </div>
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    </div>,
    document.body
  );
};