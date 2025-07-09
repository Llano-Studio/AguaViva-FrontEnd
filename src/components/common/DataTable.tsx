import React from 'react';
import { EditButton, DeleteButton, ViewButton } from './ActionButtons';
import SortBy from './SortBy';
import { getSemaphoreStyle } from './SemaphoreStatus';
import '../../styles/css/components/common/dataTable.css';

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (value: any, row: T) => React.ReactNode;
  order?: number;
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
  // Nuevo: props opcionales para semáforo
  useSemaphoreStatus?: boolean;
  semaphoreField?: keyof T;
  semaphoreColorMap?: Record<string, string>;
  semaphoreActive?: boolean;
}

function getNestedValue(obj: any, path: string | number) {
  if (typeof path === "number") return obj[path];
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
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
  onSort,
  useSemaphoreStatus = false,
  semaphoreField,
  semaphoreColorMap,
  semaphoreActive = false,
}: DataTableProps<T>) {
  return (
    <div className={`table-container ${classTable ? classTable+"-table-container" : ""}`} >
      <table className={`table ${classTable ? classTable+"-table" : ""}`}>
        <thead className={`table-thead ${classTable ? classTable+"-table-thead" : ""}`}>
          <tr>
            {columns.map((column) => {
              const idx = Array.isArray(sortBy) ? sortBy.indexOf(column.accessor as string) : -1;
              return (
                <th key={String(column.accessor)} className={`table-th ${classTable ? classTable+"-table-th" : ""}`}>
                  <span className={`table-span ${classTable ? classTable+"-table-span" : ""}`} >
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
            <th className={`table-th-acciones ${classTable ? classTable+"-table-th-acciones" : ""}`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const trStyle =
              useSemaphoreStatus && semaphoreField && semaphoreColorMap
                ? getSemaphoreStyle({
                    value: String(item[semaphoreField] ?? ""),
                    colorMap: semaphoreColorMap,
                    active: semaphoreActive,
                  })
                : {};

            return (
              <tr
                key={item.id}
                className={`table-tr ${classTable ? classTable + "-table-tr" : ""}`}
                style={trStyle}
              >
                {columns.map((column) => (
                  <td key={String(column.accessor)} className={`table-td-1 ${classTable ? classTable + "-table-td-1" : ""}`}>
                    {column.render
                      ? column.render(getNestedValue(item, String(column.accessor)), item)
                      : String(getNestedValue(item, String(column.accessor)))}
                  </td>
                ))}
                <td className={`table-td-2 ${classTable ? classTable + "-table-td-2" : ""}`}>
                  {onView && <ViewButton onClick={() => onView(item)} />}
                  {onEdit && <EditButton onClick={() => onEdit(item)} />}
                  {onDelete && <DeleteButton onClick={() => onDelete(item.id)} />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}