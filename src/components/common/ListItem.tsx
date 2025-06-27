import React, { useState } from "react";
import ModalDelete from "./ModalDelete";
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
  content?: string; // Nuevo: para pasar a ModalDelete
  genere?: "M" | "F";
}

export function ListItem<T>({
  items,
  columns,
  getKey,
  onRemove,
  content = "elemento",
  genere = "M",
}: ListItemProps<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  if (!items.length) return <div>No hay elementos.</div>;

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete && onRemove) {
      onRemove(itemToDelete);
    }
    setModalOpen(false);
    setItemToDelete(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
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
                  <button
                    type="button"
                    className="ListItem-button-delete"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <img src="/assets/icons/delete-icon.svg" alt="icono-borrar" className="ListItem-icon-delete" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {onRemove && (
        <ModalDelete
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onDelete={handleConfirmDelete}
          content={content}
          genere={genere}
        />
      )}
    </>
  );
}