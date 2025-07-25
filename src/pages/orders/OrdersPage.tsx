import React, { useState, useRef, useEffect } from "react";
import OrdersTable from "../../components/orders/OrdersTable";
import { useNavigate } from "react-router-dom";
import useOrders from "../../hooks/useOrders";
import useOrdersOneOff from "../../hooks/useOrdersOneOff";
import { orderTableColumns, OrderTableRow } from "../../config/orders/orderFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { orderFiltersConfig } from "../../config/orders/orderFiltersConfig";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import "../../styles/css/pages/pages.css";
import PaginationControls from "../../components/common/PaginationControls";
import { orderModalConfig } from "../../config/orders/orderModalConfig";
import { Modal } from "../../components/common/Modal";


const OrdersPage: React.FC = () => {
  const {
    orders: regularOrders,
    isLoading: isLoadingRegular,
    error: errorRegular,
    page: pageRegular,
    setPage: setPageRegular,
    totalPages: totalPagesRegular,
    total: totalRegular,
    search: searchRegular,
    setSearch: setSearchRegular,
    filters: filtersRegular,
    setFilters: setFiltersRegular,
    sortBy: sortByRegular,
    setSortBy: setSortByRegular,
    sortDirection: sortDirectionRegular,
    setSortDirection: setSortDirectionRegular,
    fetchOrders: fetchRegularOrders,
    deleteOrder: deleteRegularOrder,
  } = useOrders();

  const {
    orders: oneOffOrders,
    isLoading: isLoadingOneOff,
    error: errorOneOff,
    page: pageOneOff,
    setPage: setPageOneOff,
    totalPages: totalPagesOneOff,
    total: totalOneOff,
    search: searchOneOff,
    setSearch: setSearchOneOff,
    filters: filtersOneOff,
    setFilters: setFiltersOneOff,
    sortBy: sortByOneOff,
    setSortBy: setSortByOneOff,
    sortDirection: sortDirectionOneOff,
    setSortDirection: setSortDirectionOneOff,
    fetchOrders: fetchOneOffOrders,
    deleteOrder: deleteOneOffOrder,
  } = useOrdersOneOff();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "ORDER" | "ONE_OFF">("ALL");
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showSnackbar } = useSnackbar();
  const [showViewModal, setShowViewModal] = useState(false);
  const [orderToView, setOrderToView] = useState<any>(null);


  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [regularOrders, oneOffOrders]);

  // Unifica los pedidos según el filtro
  const orders = (() => {
    if (filterType === "ORDER") return regularOrders;
    if (filterType === "ONE_OFF") return oneOffOrders;
    return [...regularOrders, ...oneOffOrders];
  })();

  // Unifica paginación y totales según el filtro
  const page = filterType === "ORDER" ? pageRegular : filterType === "ONE_OFF" ? pageOneOff : 1;
  const setPage = filterType === "ORDER" ? setPageRegular : filterType === "ONE_OFF" ? setPageOneOff : () => {};
  const totalPages = filterType === "ORDER" ? totalPagesRegular : filterType === "ONE_OFF" ? totalPagesOneOff : 1;
  const total = filterType === "ORDER" ? totalRegular : filterType === "ONE_OFF" ? totalOneOff : orders.length;

  const handleDeleteClick = (id: number) => {
    const order = orders.find((o: any) => o.order_id === id || o.purchase_id === id);
    setOrderToDelete(order || null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      if (orderToDelete.order_id) {
        await deleteRegularOrder(orderToDelete.order_id);
        await fetchRegularOrders();
      } else if (orderToDelete.purchase_id) {
        await deleteOneOffOrder(orderToDelete.purchase_id);
        await fetchOneOffOrders();
      }
      showSnackbar("Pedido eliminado correctamente.", "success");
    } catch (err: any) {
      showSnackbar(err?.message || "Error al eliminar pedido", "error");
    } finally {
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const handleViewClick = (order: any) => {
    setOrderToView(order);
    setShowViewModal(true);
  };

  const handleEditClick = (order: any) => {
    // Aquí puedes abrir el modal de edición o navegar a la edición
    // Por ejemplo:
    // navigate(`/pedidos/editar/${order.order_id || order.purchase_id}`);
  };

  const handleFilterChange = (name: string, value: any) => {
    if (filterType === "ORDER") {
      setFiltersRegular((prev: any) => ({ ...prev, [name]: value }));
    } else if (filterType === "ONE_OFF") {
      setFiltersOneOff((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    setPage(1);
  };

  const handleClearFilters = () => {
    if (filterType === "ORDER") setFiltersRegular({});
    if (filterType === "ONE_OFF") setFiltersOneOff({});
    setShowFilters(false);
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (filterType === "ORDER") {
      const idx = sortByRegular.indexOf(column);
      if (idx === -1) {
        setSortByRegular([...sortByRegular, column]);
        setSortDirectionRegular([...sortDirectionRegular, "asc"]);
      } else if (sortDirectionRegular[idx] === "asc") {
        const newDirections = [...sortDirectionRegular];
        newDirections[idx] = "desc";
        setSortDirectionRegular(newDirections);
      } else if (sortDirectionRegular[idx] === "desc") {
        setSortByRegular(sortByRegular.filter((_, i) => i !== idx));
        setSortDirectionRegular(sortDirectionRegular.filter((_, i) => i !== idx));
      }
      setPageRegular(1);
    } else if (filterType === "ONE_OFF") {
      const idx = sortByOneOff.indexOf(column);
      if (idx === -1) {
        setSortByOneOff([...sortByOneOff, column]);
        setSortDirectionOneOff([...sortDirectionOneOff, "asc"]);
      } else if (sortDirectionOneOff[idx] === "asc") {
        const newDirections = [...sortDirectionOneOff];
        newDirections[idx] = "desc";
        setSortDirectionOneOff(newDirections);
      } else if (sortDirectionOneOff[idx] === "desc") {
        setSortByOneOff(sortByOneOff.filter((_, i) => i !== idx));
        setSortDirectionOneOff(sortDirectionOneOff.filter((_, i) => i !== idx));
      }
      setPageOneOff(1);
    }
  };

  const getOrderRowId = (order: OrderTableRow) => {
    return (order as any).order_id ?? (order as any).purchase_id;
  };

  const titlePage = "orders";

  return (
    <div className={`page-container ${titlePage}-page-container`}>
      {/* Panel de la tabla */}
      <div className={`page-content ${titlePage}-page-content`}>
        <div>
          <h1 className={`page-title ${titlePage}-page-title`}>Pedidos</h1>
        </div>
        <div className={`page-header ${titlePage}-page-header`}>
          <div className={`page-header-div-1 ${titlePage}-page-header-div-1`}>
            <SearchBar
              ref={searchInputRef}
              value={filterType === "ORDER" ? searchRegular : filterType === "ONE_OFF" ? searchOneOff : ""}
              onChange={filterType === "ORDER" ? setSearchRegular : filterType === "ONE_OFF" ? setSearchOneOff : () => {}}
              placeholder="Buscar pedidos..."
              class={titlePage}
            />
          </div>
          <div className={`page-header-div-2 ${titlePage}-page-header-div-2`}>
            <button
              onClick={() => setShowFilters(true)}
              className={`page-filter-button ${titlePage}-page-filter-button`}
            >
              <img
                src="/assets/icons/filter-icon.svg"
                alt="Filtros"
                className={`page-filter-button-icon ${titlePage}-page-filter-button-icon`}
                style={{ display: "inline-block" }}
              />
              Filtros
            </button>
            <button
              onClick={() => navigate("/pedidos/nuevo-pedido")}
              className={`page-new-button ${titlePage}-page-new-button`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Nuevo pedido"
                className={`page-new-button-icon ${titlePage}-page-new-button-icon`}
                style={{ display: "inline-block" }}
              />
              Nuevo Pedido
            </button>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className={`page-type-filter ${titlePage}-page-type-filter`}
              style={{ marginLeft: "1rem" }}
            >
              {(orderFiltersConfig[0]?.options ?? [])
                .filter(opt => opt && (typeof opt.value === "string" || typeof opt.value === "number"))
                .map(opt => (
                  <option key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <OrdersTable
          orders={orders}
          onEdit={handleEditClick}
          onDelete={order => handleDeleteClick(getOrderRowId(order))}
          className={titlePage}
          columns={orderTableColumns}
          sortBy={filterType === "ORDER" ? sortByRegular : sortByOneOff}
          sortDirection={filterType === "ORDER" ? sortDirectionRegular : sortDirectionOneOff}
          onSort={handleSort}
          onView={handleViewClick}
        />
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          start={(page - 1) * (orders.length || 1) + (orders.length > 0 ? 1 : 0)}
          end={(page - 1) * (orders.length || 1) + orders.length}
          total={total}
          label="pedidos"
          className={titlePage + "-page-pagination"}
        />
      </div>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setOrderToView(null);
        }}
        title="Detalles del Pedido"
        class={titlePage}
        config={orderModalConfig}
        data={orderToView}
      />

      {/* Modal de Eliminar */}
      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="pedido"
        genere="M"
      />

      {/* Drawer de filtros */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        fields={orderFiltersConfig}
        values={filterType === "ORDER" ? filtersRegular : filtersOneOff}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Loading/Error */}
      {(isLoadingRegular || isLoadingOneOff) && <div className="p-4">Cargando...</div>}
      {(errorRegular || errorOneOff) && <div className="text-red-500 p-4">{errorRegular || errorOneOff}</div>}
    </div>
  );
};

export default OrdersPage;