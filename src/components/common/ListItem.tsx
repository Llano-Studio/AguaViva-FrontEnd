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
  onCancel?: (item: T) => void;
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

  const handleDeleteClick = (item: T) => onRemove?.(item);
  const handleCancelClick = (item: T) => onCancel?.(item);

  const showActions = !!(onView || onEdit || onRemove || onCancel);

  // Plantilla de columnas consistente para header y rows
  // 1ra columna más ancha (200px) como en tu CSS; resto min 100px
  const cols: string[] = columns.map((_, idx) =>
    idx === 0 ? "minmax(200px, 2fr)" : "minmax(100px, 1fr)"
  );
  if (showActions) cols.push("120px"); // ancho fijo de acciones
  const gridTemplate = cols.join(" ");

  return (
    <table className={`listItem-table listItem-table-${content}`}>
      <thead>
        <tr
          className={`listItem-tr listItem-tr-thead listItem-tr-thead-${content}`}
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {columns.map(col => (
            <th key={col.accessor} className="listItem-th">
              <span className="listItem-cell">{col.header}</span>
            </th>
          ))}
          {showActions && (
            <th className="listItem-th">
              <span className="listItem-cell"></span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr
            key={getKey(item)}
            className={`listItem-tr listItem-tr-tbody listItem-tr-tbody-${content}`}
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {columns.map(col => (
              <td key={col.accessor} className="listItem-td">
                <span className="listItem-cell">
                  {col.render ? col.render(item) : (item as any)[col.accessor]}
                </span>
              </td>
            ))}
            {showActions && (
              <td className="listItem-td listItem-actions">
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