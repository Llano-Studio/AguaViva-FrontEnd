export interface ProductCategory {
  category_id: number;
  name: string;
}

export interface Product {
  product_id: number;
  description: string;
  volume_liters: number;
  price: number;
  is_returnable: boolean;
  serial_number: string;
  notes: string;
  productImage?: string;
  product_category: ProductCategory;
  total_stock: number;
  image_url?: string;
}

export interface CreateProductDTO {
  category_id: number;
  description: string;
  volume_liters: number;
  price: number;
  is_returnable: boolean;
  serial_number: string;
  notes: string;
  productImage?: File | null;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}