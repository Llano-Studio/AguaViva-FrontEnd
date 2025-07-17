import { useState, useEffect, useCallback } from "react";
import { ProductCategoriesService,  } from "../services/ProductCategoriesService";
import {ProductCategory} from "../interfaces/ProductCategories"

export const useProductCategories = () => {
  const service = new ProductCategoriesService();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = useCallback(async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      setIsLoading(true);
      const response = await service.getCategories(params);
      setCategories(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages || 1);
      setPage(response.meta.page || 1);
      setLimit(response.meta.limit || 100);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al cargar categorías");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories({ page, limit });
  }, [page, limit, fetchCategories]);

  const createCategory = async (name: string) => {
    try {
      setIsLoading(true);
      const newCategory = await service.createCategory(name);
      await fetchCategories({ page, limit });
      return newCategory;
    } catch (err: any) {
      setError(err?.message || "Error al crear categoría");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: number, name: string) => {
    try {
      setIsLoading(true);
      const updated = await service.updateCategory(id, name);
      await fetchCategories({ page, limit });
      return updated;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar categoría");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      console.log("entre a hook deleteCategory");
      setIsLoading(true);
      await service.deleteCategory(id);
      await fetchCategories({ page, limit });
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar categoría");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
  };
};

export default useProductCategories;