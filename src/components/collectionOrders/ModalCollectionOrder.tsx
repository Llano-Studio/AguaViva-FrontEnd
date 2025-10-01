import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { DataTable } from "../common/DataTable";
import { DatePickerWithLabel } from "../common/DatePickerWithLabel";
import Snackbar from "../common/Snackbar";
import useCollectionOrder from "../../hooks/useCollectionOrder";
import { ManualCollectionPendingCycle } from "../../interfaces/CollectionOrder";
import { buildCollectionPendingCyclesColumns } from "../../config/collectionOrders/collectionPendingCyclesColumns";
import "../../styles/css/components/collectionOrders/modalCollectionOrder.css";

interface ModalCollectionOrderProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  className?: string;
}

const ModalCollectionOrder: React.FC<ModalCollectionOrderProps> = ({
  isOpen,
  onClose,
  customerId,
  className,
}) => {
  const base = className ? `${className}-` : "collectionOrder";
  const {
    isLoading,
    error,
    customerInfo,
    pendingCycles,
    totalPending,
    fetchPendingCycles,
    generateCollectionOrder,
    resetState,
  } = useCollectionOrder();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  });
  const [notes, setNotes] = useState<string>("");
  const [selectedCycles, setSelectedCycles] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Snackbar local
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackType, setSnackType] = useState<"success" | "error" | "info">("success");
  const [snackAutoClose, setSnackAutoClose] = useState(false); // cerrar modal al cerrar snackbar si fue éxito

  useEffect(() => {
    if (!isOpen) return;
    fetchPendingCycles(customerId);
    // reset selección al abrir
    setSelectedCycles([]);
    setNotes("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
  }, [isOpen, customerId, fetchPendingCycles]);

  const rows = useMemo<ManualCollectionPendingCycle[]>(
    () => pendingCycles || [],
    [pendingCycles]
  );

  if (!isOpen) return null;

  const hasRows = rows.length > 0;

  const allSelected = hasRows && selectedCycles.length === rows.length;
  const toggleSelectAll = () => {
    if (!hasRows) return;
    if (allSelected) setSelectedCycles([]);
    else setSelectedCycles(rows.map((r) => r.cycle_id));
  };

  const isRowSelected = (row: ManualCollectionPendingCycle) =>
    selectedCycles.includes(row.cycle_id);

  const toggleRowSelection = (row: ManualCollectionPendingCycle) => {
    const id = row.cycle_id;
    setSelectedCycles((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const columns = buildCollectionPendingCyclesColumns({
    isSelected: isRowSelected,
    toggleSelection: toggleRowSelection,
  });

  const handleSubmit = async () => {
    if (!selectedCycles.length) return;
    try {
      setSubmitting(true);
      const res = await generateCollectionOrder({
        customer_id: customerId,
        selected_cycles: selectedCycles,
        collection_date: selectedDate,
        notes: notes || undefined,
      });
      // Mostrar snackbar de éxito y cerrar modal cuando el snackbar se autocierre
      setSnackMsg(res?.message || "Pedido de cobranza generado exitosamente");
      setSnackType("success");
      setSnackAutoClose(true);
      setSnackOpen(true);
      resetState();
    } catch (e: any) {
      // Mostrar snackbar de error
      setSnackMsg(e?.message || "Error al generar pedido de cobranza");
      setSnackType("error");
      setSnackAutoClose(false);
      setSnackOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnackClose = () => {
    setSnackOpen(false);
    if (snackAutoClose) {
      setSnackAutoClose(false);
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modalCollectionOrder-container">
      <div className="modalCollectionOrder-wrapper">
        <div className="modalCollectionOrder-header">
          <h2 className="modalCollectionOrder-title">Generar cobranza manual</h2>
          <button onClick={onClose} className="modalCollectionOrder-button-close">
            <img
              src="/assets/icons/filter-close.svg"
              alt="Cerrar"
              className="modalCollectionOrder-icon-close"
            />
          </button>
        </div>

        <div className="modalCollectionOrder-content">
          {isLoading ? (
            <div className="p-4">Cargando ciclos pendientes...</div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <>
              {customerInfo && (
                <div className={`${base}-customer`}>
                  <>Cliente:</>{" "} {customerInfo.name}{" "}•{" "}{customerInfo.phone}{" "}•{" "}
                  {customerInfo.address}
                </div>
              )}

              {hasRows ? (
                <>
                  <div className="modalCollectionOrder-header-actions">
                    <div className="modalCollectionOrder-select-all">
                      <label>
                        <input
                          className="form-checkbox"
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                        />{" "}
                        <p>Seleccionar todos</p>
                      </label>
                    </div>
                    <DatePickerWithLabel
                      value={selectedDate}
                      onChange={setSelectedDate}
                      className={base}
                    />
                  </div>

                  <DataTable
                    data={rows.map((r) => ({ ...r, id: r.cycle_id }))}
                    columns={columns}
                    class={`${base}-cycles`}
                  />

                  <div className={`${base}-controls`} style={{ display: "grid", gap: 12 }}>
                    <div className={`${base}-notes`}>
                      <label>Observaciones</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Observaciones de la cobranza"
                      />
                    </div>

                    <div className={`${base}-totals`}>
                      <strong>Total pendiente: </strong>${totalPending ?? 0}
                    </div>
                  </div>
                </>
              ) : (
                <div className="modalCollectionOrder-no-data">
                  El cliente no tiene pagos pendientes
                </div>
              )}
            </>
          )}
        </div>

        {hasRows && (
          <div className="modalCollectionOrder-actions">
            <button
              type="button"
              onClick={onClose}
              className="modalCollectionOrder-button-cancel form-cancel"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="modalCollectionOrder-button-submit form-submit"
              disabled={submitting || isLoading || !selectedCycles.length}
            >
              {submitting ? "Generando..." : "Generar cobranza"}
            </button>
          </div>
        )}
      </div>

      {/* Snackbar de resultado */}
      <Snackbar
        open={snackOpen}
        message={snackMsg}
        type={snackType}
        duration={3000}
        onClose={handleSnackClose}
      />
    </div>,
    document.body
  );
};

export default ModalCollectionOrder;