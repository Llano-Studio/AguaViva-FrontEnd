import React from 'react';

interface ModalConfigItem {
  label: string;
  accessor: string;
  className?: string;
  render?: (value: any, data?: any) => React.ReactNode;
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
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-15 ${classModal ? classModal+"-modal-container" : ""}`}>
      <div className={`bg-white rounded-lg p-6 max-w-2xl w-full mx-4 ${classModal ? classModal+"-modal-wrapper" : ""}`}>
        <div className={`flex justify-between items-center mb-4 ${classModal ? classModal+"-modal-header" : ""}`}>
          <h2 className={`text-xl font-bold ${classModal ? classModal+"-modal-title" : ""}`}>{title}</h2>
          <button 
            onClick={onClose}
            className={`text-gray-500 hover:text-gray-700 ${classModal ? classModal+"-modal" : ""}`}
          >
            ×
          </button>
        </div>
        {config && data ? (
          <div className={`space-y-4 ${classModal ? classModal+"-modal-content" : ""}`}>
            {config.map((item, idx) => (
              <div key={item.accessor} className={item.className ? `${classModal ? classModal+"-" : ""}${item.className}` : ""}>
                <label className={`font-bold`}>{item.label}:</label>
                <p>
                  {item.render
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