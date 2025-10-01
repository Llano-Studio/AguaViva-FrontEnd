import { Column } from "../../interfaces/Common";

export type PendingCyclesColumnsParams = {
  isSelected: (row: any) => boolean;
  toggleSelection: (row: any) => void;
};

export const buildCollectionPendingCyclesColumns = ({
  isSelected,
  toggleSelection,
}: PendingCyclesColumnsParams): Column<any>[] => [
  {
    header: "", // header debe ser string (como en RouteSheetForm)
    accessor: "selected",
    order: 0,
    render: (_: any, row: any) => (
      <input
        className="form-checkbox"
        type="checkbox"
        checked={isSelected(row)}
        onChange={() => toggleSelection(row)}
      />
    ),
  },
  { header: "Plan", accessor: "subscription_plan_name", order: 1 },
  { header: "N° ciclo", accessor: "cycle_number", order: 2 },
  { header: "Vencimiento", accessor: "payment_due_date", order: 3 },
  { header: "Pendiente", accessor: "pending_balance", order: 4 },
  { header: "Días atraso", accessor: "days_overdue", order: 5 },
  { header: "Estado", accessor: "payment_status", order: 6 },
];