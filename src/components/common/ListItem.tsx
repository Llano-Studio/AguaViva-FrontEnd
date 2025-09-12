import React from "react";
import { ViewButton, EditButton, DeleteButton, CancelButton } from "./ActionButtons";
import "../../styles/css/components/common/listItem.css";

interface ListColumn<T> {
  header: string | React.ReactNode;
  accessor: string;
  render?: (item: T) => React.ReactNode;
  order?: number;
}

interface ListItemProps<T> {
  items: T[];
  columns: ListColumn<T>[];
  getKey: (item: T) => string | number;
  onRemove?: (item: T) => void;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onCancel?: (item: T) => void; // NUEVO
  content?: string;
  genere?: "M" | "F";
}

export function ListItem<T>({
  items,
  columns,
  getKey,
  onRemove,
  onEdit,
  onView,
  onCancel,
  content
}: ListItemProps<T>) {
  if (!items.length) return <div className="listItem-empty">No hay elementos para mostrar.</div>;

  const handleDeleteClick = (item: T) => {
    if (onRemove) onRemove(item);
  };

  const handleCancelClick = (item: T) => {
    if (onCancel) onCancel(item);
  };

  const showActions = (onView || onEdit || onRemove || onCancel);

  return (
    <table className={`listItem-table listItem-table-${content}`}>
      <thead>
        <tr className={`listItem-tr listItem-tr-thead listItem-tr-thead-${content}`}>
          {columns.map(col => (
            <th key={col.accessor}>{col.header}</th>
          ))}
          {showActions && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={getKey(item)} className={`listItem-tr listItem-tr-tbody listItem-tr-tbody-${content}`}>
            {columns.map(col => (
              <td key={col.accessor}>
                {col.render ? col.render(item) : (item as any)[col.accessor]}
              </td>
            ))}
            {showActions && (
              <td>
                {onView && <ViewButton onClick={() => onView(item)} />}
                {onEdit && <EditButton onClick={() => onEdit(item)} />}
                {onCancel && <CancelButton onClick={() => handleCancelClick(item)} />}
                {onRemove && <DeleteButton onClick={() => handleDeleteClick(item)} />}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}