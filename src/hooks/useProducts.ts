import { useState, useEffect, useCallback } from 'react';
import { Product, CreateProductDTO } from '../interfaces/Product';
import { ProductService } from '../services/ProductService';
import { cleanFilters } from '../utils/filterUtils';

export const useProducts = () => {
  const productService = new ProductService();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación, filtros y ordenamiento múltiple
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ [key: string]: any }>({});
  const [sortBy, setSortBy] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<("asc" | "desc")[]>([]);

  const getSortParams = () => {
    return sortBy
      .map((field, idx) => (sortDirection[idx] === "desc" ? `-${field}` : field))
      .join(",");
  };

  const fetchProducts = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters,
      sortByParam = getSortParams()
    ) => {
      try {
        setIsLoading(true);
        
        // Limpiar filtros antes de enviar
        const cleanedFilters = cleanFilters(filtersParam);
        
        const response = await productService.getProducts({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...cleanedFilters,
        });
        if (response?.data) {
          setProducts(response.data);
          setTotal(response.meta.total);
          setTotalPages(response.meta.totalPages || 1);
          setPage(response.meta.page || 1);
          setLimit(response.meta.limit || 10);
          return true;
        }
        return false;
      } catch (err: any) {
        setError(err?.message || "Error al cargar productos");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchProducts(page, limit, search, filters, getSortParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, filters, sortBy, sortDirection]);

  const fetchProductById = useCallback(async (id: number): Promise<Product | null> => {
    try {
      setIsLoading(true);
      const product = await productService.getProductById(id);
      return product;
    } catch (err: any) {
      setError(err?.message || "Error al obtener producto");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = async (productData: CreateProductDTO | FormData, isFormData = false) => {
    try {
      setIsLoading(true);
      const newProduct = await productService.createProduct(productData as any, isFormData);
      if (newProduct) {
        await fetchProducts(page, limit, search, filters, getSortParams());
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al crear artículo");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product> | FormData, isFormData = false) => {
    try {
      setIsLoading(true);
      const updatedProduct = await productService.updateProduct(id, productData as any, isFormData);
      if (updatedProduct) {
        await fetchProducts(page, limit, search, filters, getSortParams());
        setSelectedProduct(null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar artículo");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      setIsLoading(true);
      await productService.deleteProduct(id);
      await fetchProducts(page, limit, search, filters, getSortParams());
      setSelectedProduct(null);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar artículo");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    try {
      setIsLoading(true);
      await productService.deleteProductImage(id);
      await fetchProducts(page, limit, search, filters, getSortParams());
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar imagen");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    selectedProduct,
    setSelectedProduct,
    isLoading,
    error,
    fetchProductById,
    deleteProduct,
    handleDeleteImage,
    updateProduct,
    createProduct,
    refreshProducts: () => fetchProducts(page, limit, search, filters, getSortParams()),
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    fetchProducts,
    search,
    setSearch,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
  };
};

export default useProducts;