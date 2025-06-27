import React from "react";
import ReactDOM from "react-dom";
import "../../styles/css/components/common/modalUpdate.css";

interface ModalUpdateField {
  label: string;
  accessor: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  className?: string;
  order?: number;
}

interface ModalUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  title: string;
  config: ModalUpdateField[];
  initialValues?: any;
  class?: string;
  loading?: boolean;
  error?: string | null;
  renderExtra?: React.ReactNode;
}

export const ModalUpdate: React.FC<ModalUpdateProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  config,
  initialValues = {},
  class: classModal,
  loading,
  error,
  renderExtra,
}) => {
  const [values, setValues] = React.useState<any>(initialValues);

  React.useEffect(() => {
    setValues(initialValues);
  }, [initialValues, isOpen]);

  if (!isOpen) return null;

  const handleChange = (accessor: string, value: any) => {
    setValues((prev: any) => ({ ...prev, [accessor]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return ReactDOM.createPortal(
    <div className={`modalUpdate-container ${classModal ? classModal + "-modalUpdate-container" : ""}`}>
      <div className={`modalUpdate-wrapper ${classModal ? classModal + "-modalUpdate-wrapper" : ""}`}>
        <div className={`modalUpdate-header ${classModal ? classModal + "-modalUpdate-header" : ""}`}>
          <h2 className={`modalUpdate-title ${classModal ? classModal + "-modalUpdate-title" : ""}`}>{title}</h2>
          <button onClick={onClose} className={`modalUpdate-button-close ${classModal ? classModal + "-modalUpdate-button-close" : ""}`}>
            <img src="/assets/icons/filter-close.svg" alt="Cerrar" className="modalUpdate-icon-close" />
          </button>
        </div>
        {renderExtra}
        <form onSubmit={handleFormSubmit}>
          <div className={`modalUpdate-content ${classModal ? classModal + "-modalUpdate-content" : ""}`}>
            {config.map(field => (
              <div key={field.accessor} className={field.className ? `${classModal ? classModal + "-" : ""}${field.className}` : ""}>
                <label className="modalUpdate-label">{field.label}:</label>
                <input
                  type={field.type}
                  value={values[field.accessor] ?? ""}
                  placeholder={field.placeholder}
                  required={field.required}
                  min={field.min}
                  onChange={e => handleChange(field.accessor, field.type === "number" ? Number(e.target.value) : e.target.value)}
                  className="modalUpdate-label-value"
                />
              </div>
            ))}
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="modalUpdate-delete-actions" style={{ marginTop: 24 }}>
            <button type="button" onClick={onClose} className="modalUpdate-delete-button-cancel">
              Cancelar
            </button>
            <button type="submit" className="modalUpdate-button-delete" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};