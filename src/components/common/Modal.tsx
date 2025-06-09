import React from 'react';
import '../../styles/css/components/common/modal.css'

interface ModalConfigItem {
  label: string;
  accessor: string;
  className?: string;
  render?: (value: any, data?: any) => React.ReactNode;
  isImage?: boolean; // Nuevo: indica si es una imagen
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

  return (
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
            {config.map((item, idx) => (
              <div key={item.accessor} className={item.className ? `${classModal ? classModal+"-" : ""}${item.className}` : ""}>
                <label className={`modal-label`}>{item.label}:</label>
                <p className={`modal-label-value`}>
                  {item.isImage && data[item.accessor] ? (
                    <img
                      src={data[item.accessor]}
                      alt={item.label}
                      style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : item.render
                    ? item.render(data[item.accessor], data)
                    : String(data[item.accessor] ?? "")
                  }
                </p>
              </div>
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};