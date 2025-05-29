import React from 'react';
import { EditButton, DeleteButton, ViewButton } from './ActionButtons';
import SortBy from './SortBy';

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
  class?: string;
  sortBy?: string[];
  sortDirection?: ("asc" | "desc")[];
  onSort?: (column: keyof T) => void;
}

export function DataTable<T extends { id: number }>({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onView,
  class: classTable,
  sortBy = [],
  sortDirection = [],
  onSort
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto ${classTable ? classTable+"-table-container" : ""}`} >
      <table className={`min-w-full border border-gray-300 ${classTable ? classTable+"-table" : ""}`}>
        <thead className={`bg-gray-100 ${classTable ? classTable+"-table-thead" : ""}`}>
          <tr>
            {columns.map((column) => {
              const idx = Array.isArray(sortBy) ? sortBy.indexOf(column.accessor as string) : -1;
              return (
                <th key={String(column.accessor)} className={`px-4 py-2 text-left ${classTable ? classTable+"-table-th" : ""}`}>
                  <span className="flex items-center">
                    {column.header}
                    {onSort && (
                      <SortBy
                        active={idx !== -1}
                        direction={idx !== -1 ? (sortDirection[idx] ?? null) : null}
                        onClick={() => onSort(column.accessor as keyof T)}
                      />
                    )}
                  </span>
                </th>
              );
            })}
            <th className={`px-4 py-2 text-left ${classTable ? classTable+"-table-th-acciones" : ""}`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className={`border-t border-gray-200 ${classTable ? classTable+"-table-tr" : ""}`}>
              {columns.map((column) => (
                <td key={String(column.accessor)} className={`px-4 py-2 ${classTable ? classTable+"-table-td" : ""}`}>
                  {column.render 
                    ? column.render(item[column.accessor], item)
                    : String(item[column.accessor])}
                </td>
              ))}
              <td className={`px-4 py-2 space-x-2 ${classTable ? classTable+"-table-td" : ""}`}>
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