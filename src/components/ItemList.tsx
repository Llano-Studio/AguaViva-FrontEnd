import React from "react";
import { EditButton,DeleteButton } from "../components/common/ActionButtons";

export interface DisplayField<T> {
  field: keyof T;
  label: string;
}

interface ItemListProps<T> {
  items: T[];
  itemType: string;
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  displayFields?: DisplayField<T>[];
}

export function ItemList<T extends { id: number }>({
  items,
  itemType,
  onEdit,
  onDelete,
  displayFields,
}: ItemListProps<T>) {
  if (items.length === 0) {
    return <p className="text-gray-600">No hay {itemType}s para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Listado de {itemType}s</h2>
      <table className="min-w-full border border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
            {(displayFields || Object.keys(items[0])).map((field) => {
              const label =
                typeof field === "string"
                  ? field
                  : (field as DisplayField<T>).label;
              const key =
                typeof field === "string"
                  ? field
                  : (field as DisplayField<T>).field;
              return (
                <th
                  key={String(key)}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b"
                >
                  {label}
                </th>
              );
            })}
            {(onEdit || onDelete) && (
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className={idx % 2 === 0 ? "bg-gray" : "bg-gray-500"}>
              {(displayFields || Object.entries(item)).map((field) => {
                const key =
                  typeof field === "string"
                    ? field
                    : (field as DisplayField<T>).field;
                return (
                  <td key={String(key)} className="px-4 py-2 text-sm border-b">
                    {String(item[key as keyof T])}
                  </td>
                );
              })}
              {(onEdit || onDelete) && (
                <td className="px-4 py-2 text-sm border-b">
                  {onEdit && (
                    <EditButton onClick={() => onEdit(item)} />
                  )}
                  {onDelete && (
                    <DeleteButton onClick={() => onDelete(item.id)} />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
