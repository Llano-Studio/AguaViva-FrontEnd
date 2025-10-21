import React, { useEffect, useState } from "react";
import { DataTable } from "../common/DataTable";
import PaginationControls from "../common/PaginationControls";
import useClientSubscriptions from "../../hooks/useClientSubscriptions";
import usePaymentSubscription from "../../hooks/usePaymentSubscription";
import { ClientSubscription } from "../../interfaces/ClientSubscription";
import { CyclePaymentsSummary } from "../../interfaces/PaymentSubscription";
import { clientPaymentCycleColumns } from "../../config/clients/clientPaymentCycleColumns";
import { formatDateForView } from "../../utils/formateDateForView";
import ModalclientPaymentCycle from "./ModalclientPaymentCycle";
import ModalCollectionOrder from "../collectionOrders/ModalCollectionOrder";
import "../../styles/css/components/clients/clientPayment.css"

interface ClientPaymentProps {
  clientId: number;
  onClose: () => void;
  className?: string;
}

type SubscriptionCyclesRow = {
  subscription_id: number;
  cycle_id: number;
  cycle_start: string;
  cycle_end: string;
  payment_due_date?: string | null;
  total_amount?: number;
  paid_amount?: number;
  pending_balance?: number;
  credit_balance?: number;
  payment_status?: string;
  payments?: any[];
};

const DEFAULT_LIMIT = 5;

const ClientPayment: React.FC<ClientPaymentProps> = ({ clientId, onClose, className }) => {
  const { fetchSubscriptionsByCustomer } = useClientSubscriptions();
  const { fetchCyclePayments, isLoading, error } = usePaymentSubscription();

  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [cyclesMap, setCyclesMap] = useState<Record<number, SubscriptionCyclesRow[]>>({});
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<Record<number, number>>({});
  const [limits, setLimits] = useState<Record<number, number>>({});

  // Modal ciclo
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<SubscriptionCyclesRow | null>(null);

  const base = className ? `${className}-` : "";

  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const [reloadFlag, setReloadFlag] = useState(0);
  const triggerReload = () => setReloadFlag(f => f + 1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res: any = await fetchSubscriptionsByCustomer(clientId);
        const list: ClientSubscription[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (cancelled) return;
        setSubscriptions(list);

        // Cargar resumen de pagos por ciclo para cada suscripción
        const newCyclesMap: Record<number, SubscriptionCyclesRow[]> = {};
        for (const sub of list) {
          const rows: SubscriptionCyclesRow[] = [];
          const cycles = sub.subscription_cycle || [];
          for (const c of cycles) {
            try {
              const summary: CyclePaymentsSummary = await fetchCyclePayments(c.cycle_id);
              rows.push({
                subscription_id: sub.subscription_id,
                cycle_id: c.cycle_id,
                cycle_start: c.cycle_start,
                cycle_end: c.cycle_end,
                payment_due_date: summary?.payment_due_date ?? null,
                total_amount: summary?.total_amount ?? undefined,
                paid_amount: summary?.paid_amount ?? undefined,
                pending_balance: summary?.pending_balance ?? undefined,
                credit_balance: summary?.credit_balance ?? undefined,
                payment_status: summary?.payment_status ?? undefined,
                payments: summary?.payments ?? [],
              });
            } catch (err) {
              console.error("[ClientPayment] error fetching cycle payments:", c.cycle_id, err);
              rows.push({
                subscription_id: sub.subscription_id,
                cycle_id: c.cycle_id,
                cycle_start: c.cycle_start,
                cycle_end: c.cycle_end,
                payments: [],
              });
            }
          }
          newCyclesMap[sub.subscription_id] = rows;
        }
        if (!cancelled) setCyclesMap(newCyclesMap);

        // paginación por suscripción
        const initPages: Record<number, number> = {};
        const initLimits: Record<number, number> = {};
        list.forEach(s => { initPages[s.subscription_id] = 1; initLimits[s.subscription_id] = DEFAULT_LIMIT; });
        if (!cancelled) { setPages(initPages); setLimits(initLimits); }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [clientId, fetchSubscriptionsByCustomer, fetchCyclePayments, reloadFlag]);


  const handlePageChange = (subscriptionId: number, page: number) => {
    setPages(prev => ({ ...prev, [subscriptionId]: page }));
  };

  const openCycleModal = (row: SubscriptionCyclesRow) => {
    setSelectedCycle(row);
    setShowCycleModal(true);
  };

  const closeCycleModal = () => {
    setShowCycleModal(false);
    setSelectedCycle(null);
  };

  const renderSubscriptionBlock = (sub: ClientSubscription) => {
    const allRows = cyclesMap[sub.subscription_id] || [];
    const page = pages[sub.subscription_id] || 1;
    const limit = limits[sub.subscription_id] || DEFAULT_LIMIT;

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedRows = allRows.slice(startIdx, endIdx);
    const totalPages = Math.max(1, Math.ceil(allRows.length / limit));
    const start = allRows.length ? startIdx + 1 : 0;
    const end = Math.min(endIdx, allRows.length);

    const tableData = paginatedRows.map(r => ({ ...r, id: r.cycle_id }));

    return (
      <>
        <div key={sub.subscription_id} className={`${base}payment-block`}>
          <h3 className="subscriptionClient-title">
            {sub.subscription_plan?.name ?? `Suscripción #${sub.subscription_id}`} • Inicio: {formatDateForView(sub.start_date)} • Vencimiento: {sub.collection_day}
          </h3>

          <DataTable
            data={tableData}
            columns={clientPaymentCycleColumns}
            onPayment={(row: SubscriptionCyclesRow) => openCycleModal(row)}
            class={`${base}cycles`}
          />

          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => handlePageChange(sub.subscription_id, p)}
            start={start}
            end={end}
            total={allRows.length}
            label="ciclos"
            className={`${base}cycles-page-pagination`}
          />
        </div>
      </>
    );
  };

  if (loading || isLoading) {
    return <div className="p-4">Cargando pagos...</div>;
  }
  if (error) {
    console.error("[ClientPayment] error state:", error);
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!subscriptions.length) {
    return <div className="p-4">El cliente no posee suscripciones.</div>;
  }

  return (
    <div className={`${base}payments-container`}>
      <div>
        <button
          type="button"
          className="form-submit new-collectionOrder-button"
          onClick={() => setShowCollectionModal(true)}
        >
          Generar pedido de cobranza
        </button>
      </div>
      
      {subscriptions.map(renderSubscriptionBlock)}

      <ModalclientPaymentCycle
        isOpen={showCycleModal}
        onClose={closeCycleModal}
        cycle={selectedCycle}
        onChange={triggerReload}
      />

      {/* Modal de cobranza manual */}
      <ModalCollectionOrder
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        customerId={clientId}
        onChange={triggerReload}
      />
    </div>
  );
};

export default ClientPayment;