import { useState, useEffect, useCallback } from 'react';
import { User, CreateUserDTO } from '../interfaces/User';
import { UserService } from '../services/UserService';

export const useUsers = () => {
  const userService = new UserService();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación y filtros
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ [key: string]: any }>({});

  const fetchUsers = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters
    ) => {
      try {
        setIsLoading(true);
        const response = await userService.getUsers({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
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
      } catch (err) {
        setError('Error al cargar usuarios');
        console.error(err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters]
  );

  useEffect(() => {
    fetchUsers(page, limit, search, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, filters]);

  const createUser = async (userData: CreateUserDTO) => {
    try {
      setIsLoading(true);
      const newUser = await userService.createUser(userData);
      if (newUser) {
        await fetchUsers(page, limit, search, filters);
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al crear usuario');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedUser = await userService.updateUser(id, userData);
      if (updatedUser) {
        await fetchUsers(page, limit, search, filters);
        setSelectedUser(null);
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al actualizar usuario');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await userService.deleteUser(id);
      await fetchUsers(page, limit, search, filters);
      setSelectedUser(null);
      return true;
    } catch (err) {
      setError('Error al eliminar usuario');
      console.error(err);
      return false;
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
    handleDelete,
    updateUser,
    createUser,
    refreshUsers: () => fetchUsers(page, limit, search, filters),
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
  };
};

export default useUsers;