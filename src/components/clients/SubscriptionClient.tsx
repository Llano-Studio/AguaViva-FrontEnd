import React, { useState, useEffect, useRef } from "react";
import ModalSubscriptionClient from "./ModalSubscriptionClient";
import { ListItem } from "../common/ListItem";
import { clientSubscriptionListColumns } from "../../config/clients/clientSubscriptionListColumns";
import { clientSubscriptionModalConfig } from "../../config/clients/clientSubscriptionModalConfig";
import { Modal } from "../common/Modal";
import { SubscriptionPlanService } from "../../services/SubscriptionPlanService";
import { ClientSubscriptionService } from "../../services/ClientSubscriptionService";
import useClientSubscriptions from "../../hooks/useClientSubscriptions";
import ModalDeleteConfirm from "../common/ModalDeleteConfirm";
import { parseTimeRangeFields } from "../../utils/parseTimeRangeFields";
import { useSnackbar } from "../../context/SnackbarContext";
import ModalCancelledSubscription from "./ModalCancelledSubscription";
import ModalCancelledConfirm from "../common/ModalCancelledConfirm";
import useClients from "../../hooks/useClients";
import useCancellationOrders from "../../hooks/useCancellationOrders";
import { ClientSubscription, CreateClientSubscriptionDTO, UpdateClientSubscriptionDTO } from "../../interfaces/ClientSubscription";
import { getDefaultCollectionDay } from "../../utils/getDefaultCollectionDay";
import "../../styles/css/components/clients/subscriptionClient.css";

interface SubscriptionClientProps {
  clientId: number;
  isEditing: boolean;
  reloadFlag?: number;
  triggerReload?: () => void;
}

const SubscriptionClient: React.FC<SubscriptionClientProps> = ({ clientId, isEditing, reloadFlag, triggerReload }) => {
  const [showModal, setShowModal] = useState(false);
  const [showViewSubscriptionModal, setShowViewSubscriptionModal] = useState(false);
  const [subscriptionToView, setSubscriptionToView] = useState<any>(null);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<any>(null);
  const [plansOptions, setPlansOptions] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<any>(null);
  const { cancelSubscription } = useClients();
 

  // Listas separadas
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [cancelledSubscriptions, setCancelledSubscriptions] = useState<any[]>([]);

  // Estados Cancelacion
  const [showCancelFormModal, setShowCancelFormModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<any>(null);
  const [cancelFormValues, setCancelFormValues] = useState<any>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const subsServiceRef = useRef(new ClientSubscriptionService());
  const { showSnackbar } = useSnackbar();

  const {
    // El hook lo seguimos usando para create/update/delete
    createSubscription,
    deleteSubscription,
    updateSubscription,
  } = useClientSubscriptions();

  useEffect(() => {
    const fetchPlans = async () => {
      const service = new SubscriptionPlanService();
      const res = await service.getSubscriptionPlans();
      if (res && res.data) {
        setPlansOptions(
          res.data.map((plan: any) => ({
            label: plan.name,
            value: plan.subscription_plan_id,
          }))
        );
      }
    };
    fetchPlans();
  }, []);

  // Cargar ambas listas por estado
  useEffect(() => {
    if (isEditing && clientId) {
      void refreshLists();
    }
  }, [isEditing, clientId, reloadFlag]);

  const refreshLists = async () => {
    if (!clientId) return;
    try {
      const [act, canc] = await Promise.all([
        subsServiceRef.current.getSubscriptionsByCustomer(clientId, { status: "ACTIVE" }),
        subsServiceRef.current.getSubscriptionsByCustomer(clientId, { status: "CANCELLED" }),
      ]);
      setActiveSubscriptions(Array.isArray(act?.data) ? act.data : []);
      setCancelledSubscriptions(Array.isArray(canc?.data) ? canc.data : []);
    } catch {
      setActiveSubscriptions([]);
      setCancelledSubscriptions([]);
    }
  };

  const handleAddSubscription = async (values: CreateClientSubscriptionDTO) => {
    setLoading(true);
    setSubscriptionError(null);
    try {
      const dataToSend: CreateClientSubscriptionDTO = {
        ...values,
        customer_id: clientId,
        collection_day: values.collection_day ?? getDefaultCollectionDay(),
        payment_mode: values.payment_mode || "ADVANCE",
        status: "ACTIVE",
      };

      if (!dataToSend.delivery_preferences?.preferred_days || dataToSend.delivery_preferences.preferred_days.length === 0) {
        if (dataToSend.delivery_preferences) delete dataToSend.delivery_preferences.preferred_days;
      }

      await createSubscription(dataToSend);
      setShowModal(false);
      await refreshLists();
      showSnackbar("Suscripción creada correctamente.", "success");
      if (triggerReload) triggerReload();
    } catch (err: any) {
      const msg = err?.message || "Error al agregar abono";
      setSubscriptionError(msg);
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscription = (item: any) => {
    setSubscriptionToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!subscriptionToDelete) return;
    try {
      await deleteSubscription(subscriptionToDelete.subscription_id);
      await refreshLists();
      showSnackbar("Suscripción eliminada correctamente.", "success");
      if (triggerReload) triggerReload();
    } catch (err: any) {
      showSnackbar(err?.message || "Error al eliminar la suscripción", "error");
    } finally {
      setShowDeleteModal(false);
      setSubscriptionToDelete(null);
    }
  };

  const handleOpenEditSubscription = (item: any) => {
    setSubscriptionToEdit(item);
    setShowModal(true);
  };

  const handleEditSubscription = async (values: UpdateClientSubscriptionDTO) => {
    setLoading(true);
    setShowModal(true);
    setSubscriptionError(null);
    try {
      const dataToSend: UpdateClientSubscriptionDTO = { ...values };

      if (!dataToSend.delivery_preferences?.preferred_days || dataToSend.delivery_preferences.preferred_days.length === 0) {
        if (dataToSend.delivery_preferences) delete dataToSend.delivery_preferences.preferred_days;
      }

      const cleaned = cleanSubscriptionPayload(dataToSend);
      await updateSubscription(subscriptionToEdit.subscription_id, cleaned);
      setShowModal(false);
      setSubscriptionToEdit(null);
      await refreshLists();
      showSnackbar("Suscripción actualizada correctamente.", "success");
      if (triggerReload) triggerReload();
    } catch (err: any) {
      const msg = err?.message || "Error al editar abono";
      setSubscriptionError(msg);
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscription = (item: any) => {
    setSubscriptionToView(item);
    setShowViewSubscriptionModal(true);
  };

  if (!isEditing) return null;


  const handleCancelledSubscriptions = (item: any) => {
    setSubscriptionToCancel(item);
    setCancelFormValues(null);
    setShowCancelFormModal(true);
  };

  // Submit del formulario (primer modal) -> abre confirm
  const handlePrepareCancellation = async (values: any) => {
    setCancelFormValues(values);
    setShowCancelFormModal(false);
    setShowCancelConfirmModal(true);
  };

  const executeCancellation = async () => {
    if (!subscriptionToCancel || !cancelFormValues) {
      setShowCancelConfirmModal(false);
      return;
    }
    setCancelLoading(true);
    setCancelError(null);
    try {
      // Solo cancelar suscripción (enviar payload nuevo)
      await cancelSubscription(
        subscriptionToCancel.customer_id || clientId,
        subscriptionToCancel.subscription_id,
        {
          cancellation_date:
            cancelFormValues?.cancellation_date ||
            cancelFormValues?.scheduled_collection_date ||
            new Date().toISOString().slice(0, 10), // YYYY-MM-DD
          notes: cancelFormValues?.notes || undefined,
        }
      );

      showSnackbar("Suscripción cancelada correctamente.", "success");
      setShowCancelConfirmModal(false);
      setSubscriptionToCancel(null);
      setCancelFormValues(null);
      await refreshLists();
    } catch (e: any) {
      const msg = e?.message || "Error al cancelar abono";
      setCancelError(msg);
      showSnackbar(msg, "error");
    } finally {
      setCancelLoading(false);
    }
  };

  function cleanSubscriptionPayload(data: any): UpdateClientSubscriptionDTO {
    return {
      subscription_plan_id: data.subscription_plan_id,
      start_date: data.start_date,
      collection_day: data.collection_day,
      payment_mode: data.payment_mode,
      payment_due_day: data.payment_due_day,
      status: data.status,
      notes: data.notes,
      delivery_preferences: data.delivery_preferences,
    };
  }

  const initialValues =
    subscriptionToEdit
      ? {
          ...subscriptionToEdit,
          delivery_preferences: parseTimeRangeFields(subscriptionToEdit.delivery_preferences, [
            {
              source: "preferred_time_range",
              start: "preferred_time_range_start",
              end: "preferred_time_range_end",
            },
            {
              source: "avoid_times",
              start: "avoid_times_start",
              end: "avoid_times_end",
              isArray: true,
            },
          ]),
        }
      : undefined;

  return (
    <div className="subscriptionClient-actions-container">
      <div className="subscriptionClient-actions-title">
        <h2 className="subscriptionClient-title">Abonos del cliente</h2>
        <button
          onClick={() => setShowModal(true)}
          className={`page-new-button subscriptionClient-new-button`}
        >
          <img
            src="/assets/icons/huge-icon.svg"
            alt="Agregar abono"
            className={`page-new-button-icon`}
            style={{ display: "inline-block" }}
          />
          Agregar Abono
        </button>
      </div>

      <ModalSubscriptionClient
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSubscriptionToEdit(null);
        }}
        onSubmit={subscriptionToEdit ? handleEditSubscription : handleAddSubscription}
        initialValues={initialValues}
        plansOptions={plansOptions}
        loading={loading}
        error={subscriptionError}
      />

      <h3 className="subscriptionClient-title">Activos</h3>
      <ListItem
        items={activeSubscriptions}
        columns={clientSubscriptionListColumns}
        getKey={(item) => item.subscription_id}
        content="abono"
        genere="M"
        onRemove={handleRemoveSubscription}
        onEdit={handleOpenEditSubscription}
        onView={handleViewSubscription}
        onCancel={handleCancelledSubscriptions}
      />

      {cancelledSubscriptions.length > 0 && (
        <>
          <h3 className="subscriptionClient-title">Cancelados</h3>
          <ListItem
            items={cancelledSubscriptions}
            columns={clientSubscriptionListColumns}
            getKey={(item) => item.subscription_id}
            content="abonos-cancelled"
            genere="M"
            onView={handleViewSubscription}
          />
        </>
      )}

      <Modal
        isOpen={showViewSubscriptionModal}
        onClose={() => setShowViewSubscriptionModal(false)}
        title="Detalle del abono"
        config={clientSubscriptionModalConfig}
        data={subscriptionToView}
      />

      <ModalCancelledSubscription
        isOpen={showCancelFormModal}
        onClose={() => {
          setShowCancelFormModal(false);
          setSubscriptionToCancel(null);
          setCancelFormValues(null);
        }}
        onSubmit={handlePrepareCancellation}
        initialValues={null}
        loading={cancelLoading}
        error={cancelError}
      />

      <ModalCancelledConfirm
        isOpen={showCancelConfirmModal}
        onClose={() => {
          setShowCancelConfirmModal(false);
          setSubscriptionToCancel(null);
          setCancelFormValues(null);
        }}
        onDelete={executeCancellation}
        content="abono"
        genere="M"
      />

      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSubscriptionToDelete(null);
        }}
        onDelete={handleConfirmDelete}
        content="abono"
        genere="M"
      />
    </div>
  );
};

export default SubscriptionClient;