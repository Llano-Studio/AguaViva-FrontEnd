import React from "react";

interface ItemListProps<T> {
  items: T[];
  itemType: string;
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
}

export function ItemList<T extends { id: number }>({
  items,
  itemType,
  onEdit,
  onDelete,
}: ItemListProps<T>) {
  return (
    <div>
      <h2>Listado de {itemType}s</h2>
      {items.length === 0 ? (
        <p>No hay {itemType}s para mostrar.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {Object.entries(item).map(([key, value]) => (
                <span key={key}>
                  <strong>{key}:</strong> {String(value)}{" "}
                </span>
              ))}

              {onEdit && <button onClick={() => onEdit(item)}>Editar</button>}
              {onDelete && (
                <button onClick={() => onDelete(item.id)}>Eliminar</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
