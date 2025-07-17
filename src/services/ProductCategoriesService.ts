import { httpAdapter } from "./httpAdapter";
import { ProductCategory, ProductCategoriesResponse } from "../interfaces/ProductCategories";

export class ProductCategoriesService {
  private categoriesUrl = "/categories";

  async getCategories(params?: { page?: number; limit?: number; search?: string }): Promise<ProductCategoriesResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 100,
    };
    return await httpAdapter.get<ProductCategoriesResponse>(this.categoriesUrl, { params: safeParams });
  }

  async getCategoryById(id: number): Promise<ProductCategory | null> {
    try {
      return await httpAdapter.get<ProductCategory>(`${this.categoriesUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener categoría");
    }
  }

  async createCategory(name: string): Promise<ProductCategory> {
    try {
      return await httpAdapter.post<ProductCategory>({ name }, this.categoriesUrl);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear categoría");
    }
  }

  async updateCategory(id: number, name: string): Promise<ProductCategory> {
    try {
      return await httpAdapter.put<ProductCategory>({ name }, `${this.categoriesUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar categoría");
    }
  }

  async deleteCategory(id: number): Promise<{ message: string; deleted: boolean }> {
    try {
      return await httpAdapter.delete<{ message: string; deleted: boolean }>(`${this.categoriesUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar categoría");
    }
  }
}