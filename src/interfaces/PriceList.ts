export interface PriceList {
  price_list_id: number;
  name: string;
  description?: string;
  is_default: boolean;
  active: boolean;
  effective_date: string;
  created_at?: string;
  updated_at?: string;
  price_list_item?: any[]; // Puedes tipar esto mejor cuando definas los items
}

export interface CreatePriceListDTO {
  name: string;
  description?: string;
  is_default: boolean;
  active: boolean;
  effective_date: string;
}

export interface UpdatePriceListDTO {
  name?: string;
  description?: string;
  is_default?: boolean;
  active?: boolean;
  effective_date?: string;
}

export interface PriceListsResponse {
  data: PriceList[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PriceListHistoryItem {
  history_id: number;
  price_list_item_id: number;
  product_id: number;
  product_name: string;
  previous_price: string;
  new_price: string;
  change_date: string;
  change_percentage: string;
  change_reason: string;
  created_by: string;
}

export interface PriceListHistoryResponse {
  data: PriceListHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PriceListHistoryItem {
  history_id: number;
  price_list_item_id: number;
  product_id: number;
  product_name: string;
  previous_price: string;
  new_price: string;
  change_date: string;
  change_percentage: string;
  change_reason: string;
  created_by: string;
}

// Respuesta con meta paginada para historial de lista e item
export interface PriceListHistoryListResponse {
  data: PriceListHistoryItem[];
  meta: PaginatedMeta;
}

// Payload y respuesta para deshacer actualizaciones de precio
export interface UndoPriceUpdateRequest {
  history_ids: number[];
  reason: string;
  created_by: string;
}

export interface UndoPriceUpdateResponse {
  message: string;
  reverted_items: number;
  history_ids: number[];
}