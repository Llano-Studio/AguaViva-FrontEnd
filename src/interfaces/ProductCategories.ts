export interface CreateProductCategoryDTO {
  name: string;
}

export interface ProductCategory extends CreateProductCategoryDTO {
  category_id: number;
  product?: {
    product_id: number;
    description: string;
  }[];
}

export interface ProductCategoriesResponse {
  data: ProductCategory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}