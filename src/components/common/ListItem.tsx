import React from "react";
import "../../styles/css/components/common/listItem.css";

interface ListColumn<T> {
  header: string;
  accessor: string;
  render?: (item: T) => React.ReactNode;
  order?: number;
}

interface ListItemProps<T> {
  items: T[];
  columns: ListColumn<T>[];
  getKey: (item: T) => string | number;
  onRemove?: (item: T) => void;
}

export function ListItem<T>({ items, columns, getKey, onRemove }: ListItemProps<T>) {
  console.log("ListItem rendered with items:", items);
  console.log("ListItem columns:", columns);``
  if (!items.length) return <div>No hay elementos.</div>;

  return (
    <table className="listItem-table">
      <thead>
        <tr className="listItem-tr listItem-tr-thead">
          {columns.map(col => (
            <th key={col.accessor}>{col.header}</th>
          ))}
          {onRemove && <th></th>}
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
            {onRemove && (
              <td>
                <button type="button" className="ListItem-button-delete" onClick={() => onRemove(item)}>
                  <img src="/assets/icons/delete-icon.svg" alt="icono-borrar" className="ListItem-icon-delete" />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}