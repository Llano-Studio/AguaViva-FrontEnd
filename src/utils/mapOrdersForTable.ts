export type AnyRow = Record<string, any>;

export function mapOrdersForTable<T extends AnyRow>(rows: T[]) {
  return rows.map((row) => {
    const id = row.order_id ?? row.purchase_id ?? row.id;
    return {
      ...row,
      id,
      customer: row.customer ?? { name: row.person?.name ?? "" },
      order_type: row.order_type ?? "ONE_OFF",
      order_date: row.order_date ?? row.purchase_date ?? "",
      scheduled_delivery_date: row.scheduled_delivery_date ?? "",
      status: row.status ?? row.delivery_status ?? "",
      total_amount: row.total_amount ?? "",
    } as T & { id: any };
  });
}