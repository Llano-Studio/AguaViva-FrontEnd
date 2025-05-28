import React from 'react';
import { EditButton, DeleteButton, ViewButton } from './ActionButtons';

export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: number }> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  onView?: (item: T) => void;
}

export function DataTable<T extends { id: number }>({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onView 
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column) => (
              <th key={String(column.accessor)} className="px-4 py-2 text-left">
                {column.header}
              </th>
            ))}
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t border-gray-200">
              {columns.map((column) => (
                <td key={String(column.accessor)} className="px-4 py-2">
                  {column.render 
                    ? column.render(item[column.accessor], item)
                    : String(item[column.accessor])}
                </td>
              ))}
              <td className="px-4 py-2 space-x-2">
                {onView && <ViewButton onClick={() => onView(item)} />}
                {onEdit && <EditButton onClick={() => onEdit(item)} />}
                {onDelete && <DeleteButton onClick={() => onDelete(item.id)} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}