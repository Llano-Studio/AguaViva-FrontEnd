import React from "react";
import ReactDOM from "react-dom";
import "../../styles/css/components/common/modal.css";
import { ListItem } from "./ListItem";

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
  itemsForList?: any[];
  itemsConfig?: { header: string | React.ReactNode; accessor: string; render?: (item: any) => React.ReactNode }[];
  itemsTitle?: string; // Título para los productos en comodato
  loadingItems?: boolean;
  getItemKey?: (item: any) => string | number;
  buttonAction?: { label: string; onClick: () => void; className?: string };
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
  data,
  itemsForList,
  itemsConfig,
  itemsTitle,
  loadingItems,
  getItemKey,
  buttonAction
}) => {

  console.log("items: ",itemsForList)
  if (!isOpen) return null;

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
          <div className={`modal-view-content ${classModal ? classModal+"-modal-view-content" : ""}`}>
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

        {/* Renderizar Items */}
          {itemsForList && itemsConfig && (
            <div className="modal-items-list-container">
              {itemsTitle && <h3>{itemsTitle}</h3>}
              <div className={`table-scroll`}>
                {loadingItems ? (
                  <div style={{ padding: 24, textAlign: "center" }}>Cargando productos...</div>
                ) : (
                  <ListItem
                    items={itemsForList}
                    columns={itemsConfig}
                    getKey={getItemKey || ((item) => item.id || item.product_id)}
                  />
                )}
              </div>
            </div>
          )}
          {/* Acción opcional */}
          {buttonAction && (
            <div className={`modal-actions ${classModal ? classModal+"-modal-actions" : ""}`}>
              <button
                type="button"
                onClick={buttonAction.onClick}
                className={`modal-action-button ${classModal ? classModal+"-modal-action-button" : ""} ${buttonAction.className ?? ""}`}
              >
                {buttonAction.label}
              </button>
            </div>
          )}
      </div>
    </div>,
    document.body
  );
};