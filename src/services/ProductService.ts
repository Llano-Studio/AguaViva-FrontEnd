import { Product, ProductsResponse, CreateProductDTO, ProductCategory } from "../interfaces/Product";
import { httpAdapter } from "./httpAdapter";

export class ProductService {
  private productsUrl = "/products";

  async getProducts(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<ProductsResponse> {
    return await httpAdapter.get<ProductsResponse>(this.productsUrl, { params });
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
      return await httpAdapter.get<Product>(`${this.productsUrl}/${id}`);
    } catch (error) {
      console.error("Error en getProductById:", error);
      return null;
    }
  }

  async createProduct(product: FormData | CreateProductDTO, isFormData = false): Promise<Product | null> {
    console.log("createProduct: ", product);
    try {
      return await httpAdapter.post<Product>(product, this.productsUrl, isFormData ? { isFormData: true } : undefined);
    } catch (error) {
      console.error("Error en createProduct:", error);
      return null;
    }
  }

  async updateProduct(id: number, product: Partial<Product> | FormData, isFormData = false): Promise<Product | null> {
    try {
      if (product instanceof FormData) {
        return await httpAdapter.put<Product>(product, `${this.productsUrl}/${id}`, isFormData ? { isFormData: true } : undefined);
      } else {
        return await httpAdapter.put<Product>(product, `${this.productsUrl}/${id}`);
      }
    } catch (error) {
      console.error("Error en updateProduct:", error);
      return null;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.productsUrl}/${id}`);
      return true;
    } catch (error) {
      console.error("Error en deleteProduct:", error);
      return false;
    }
  }

  async deleteProductImage(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.productsUrl}/${id}/image`);
      return true;
    } catch (error) {
      console.error("Error en deleteProductImage:", error);
      return false;
    }
  }

  async getCategories(): Promise<ProductCategory[]> {
    try {
      const res = await httpAdapter.get<{ data: ProductCategory[] }>("/categories");
      return res.data;
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return [];
    }
  }

}