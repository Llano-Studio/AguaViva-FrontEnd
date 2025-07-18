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
}

// Validaciones opcionales
interface FieldValidation {
  required?: boolean;
  isEmail?: boolean;
  minLength?: number;
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
  | "time";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (value: any, row: T) => React.ReactNode;
  order?: number;
}