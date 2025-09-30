export interface Field<T> {
  name: keyof T | string;
  label: string;
  type?: FieldType;
  options?: { label: string; value: string | number }[];
  validation?: FieldValidation;
  order?: number;
  defaultValue?: any;
  multiple?: boolean;
  value?: any;
  onChange?: (name: string, value: any) => void;
  disabled?: boolean;
}

// Validaciones opcionales
interface FieldValidation {
  required?: boolean;
  isEmail?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp | string;
}

// Definición de un campo del formulario
export type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "file"
  | "date"
  | "textarea"
  | "password"
  | "email"
  | "multiselect"
  | "time"
  | "search"
  | "datetime-local"
  | "taxId";

export interface Column<T> {
  header: string;
  accessor: string | number | ((row: T) => any);
  render?: (value: any, row: T) => React.ReactNode;
  order?: number;
}