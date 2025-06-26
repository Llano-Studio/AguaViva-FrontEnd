export interface PriceListItem {
  price_list_item_id: number;
  price_list_id: number;
  product_id: number;
  unit_price: number;
  product?: {
    product_id: number;
    description: string;
    code: string;
    image_url?: string;
    category_id?: number;
    volume_liters?: number;
    price?: number;
    is_returnable?: boolean;
    serial_number?: string;
    notes?: string;
  };
  price_list?: {
    price_list_id: number;
    name: string;
  };
}

export interface CreatePriceListItemDTO {
  price_list_id: number;
  product_id: number;
  unit_price: number;
}

export interface UpdatePriceListItemDTO {
  unit_price: number;
}

export interface PriceListItemResponse {
  price_list_item_id: number;
  price_list_id: number;
  product_id: number;
  unit_price: number;
  product?: {
    product_id: number;
    description: string;
    code: string;
    image_url?: string;
  };
  price_list?: {
    price_list_id: number;
    name: string;
  };
}

export interface PriceListItemsResponse {
  data: PriceListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}