import { Order } from "./Order";

// Puedes extender o adaptar según la estructura de tu backend
export type Delivery = Order & {
  // Puedes agregar campos específicos de la entrega aquí si los hay
  // ejemplo: delivery_status?: string;
};

export interface DeliveriesResponse {
  data: Delivery[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// DTO para crear o actualizar una entrega (si aplica)
export interface CreateDeliveryDTO {
  // Define los campos necesarios para crear una entrega
  // ejemplo:
  // order_ids: number[];
  // delivery_date: string;
}