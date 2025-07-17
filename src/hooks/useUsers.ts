import { useState, useEffect, useCallback } from 'react';
import { User, CreateUserDTO } from '../interfaces/User';
import { UserService } from '../services/UserService';

export const useUsers = () => {
  const userService = new UserService();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const fetchUsers = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters,
      sortByParam = getSortParams()
    ) => {
      try {
        setIsLoading(true);
        const response = await userService.getUsers({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...filtersParam,
        });
        if (response?.data) {
          setUsers(response.data);
          setTotal(response.meta.total);
          setTotalPages(response.meta.totalPages || 1);
          setPage(response.meta.page || 1);
          setLimit(response.meta.limit || 10);
          return true;
        }
        return false;
      } catch (err: any) {
        setError(err?.message || "Error al cargar usuarios");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchUsers(page, limit, search, filters, getSortParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, filters, sortBy, sortDirection]);

  const createUser = async (userData: CreateUserDTO | FormData, isFormData = false) => {
    try {
      setIsLoading(true);
      const newUser = await userService.createUser(userData as any, isFormData);
      if (newUser) {
        await fetchUsers(page, limit, search, filters, getSortParams());
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al crear usuario");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: number, userData: Partial<User> | FormData, isFormData = false) => {
    try {
      setIsLoading(true);
      const updatedUser = await userService.updateUser(id, userData as any, isFormData);
      if (updatedUser) {
        await fetchUsers(page, limit, search, filters, getSortParams());
        setSelectedUser(null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar usuario");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setIsLoading(true);
      await userService.deleteUser(id);
      await fetchUsers(page, limit, search, filters, getSortParams());
      setSelectedUser(null);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar usuario");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    selectedUser,
    setSelectedUser,
    isLoading,
    error,
    deleteUser,
    updateUser,
    createUser,
    refreshUsers: () => fetchUsers(page, limit, search, filters, getSortParams()),
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    fetchUsers,
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

export default useUsers;