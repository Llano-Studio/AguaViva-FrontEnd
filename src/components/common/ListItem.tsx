import React from "react";
import { ViewButton, EditButton, DeleteButton } from "./ActionButtons";
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
}: ListItemProps<T>) {
  if (!items.length) return <div>No hay elementos para mostrar.</div>;

  const handleDeleteClick = (item: T) => {
    if (onRemove) {
      onRemove(item); // Llama directamente al handler del padre
    }
  };

  return (
    <>
      <table className="listItem-table">
        <thead>
          <tr className="listItem-tr listItem-tr-thead">
            {columns.map(col => (
              <th key={col.accessor}>{col.header}</th>
            ))}
            {(onView || onEdit || onRemove) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={getKey(item)} className="listItem-tr listItem-tr-tbody">
              {columns.map(col => (
                <td key={col.accessor}>
                  {col.render ? col.render(item) : (item as any)[col.accessor]}
                </td>
              ))}
              {(onView || onEdit || onRemove) && (
                <td>
                  {onView && <ViewButton onClick={() => onView(item)} />}
                  {onEdit && <EditButton onClick={() => onEdit(item)} />}
                  {onRemove && (
                    <DeleteButton onClick={() => handleDeleteClick(item)} />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}