import { OrderItemInputForm } from "../interfaces/Order";

export function calculatePriceTotalOrder(articles: OrderItemInputForm[]): string {
  return articles
    .reduce((acc, item) => acc + Number(item.price_total_item ?? 0), 0)
    .toFixed(2);
}