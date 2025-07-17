import React, { useState, useEffect } from "react";
import ModalSubscriptionClient from "./ModalSubscriptionClient";
import { ListItem } from "../common/ListItem";
import { clientSubscriptionListColumns } from "../../config/clients/clientSubscriptionListColumns";
import { clientSubscriptionModalConfig } from "../../config/clients/clientSubscriptionModalConfig";
import { Modal } from "../common/Modal";
import { SubscriptionPlanService } from "../../services/SubscriptionPlanService";
import useClientSubscriptions from "../../hooks/useClientSubscriptions";
import ModalDeleteConfirm from "../common/ModalDeleteConfirm";
import { parseTimeRangeFields } from "../../utils/parseTimeRangeFields";
import "../../styles/css/components/clients/subscriptionClient.css";

interface SubscriptionClientProps {
  clientId: number;
  isEditing: boolean;
}

const SubscriptionClient: React.FC<SubscriptionClientProps> = ({ clientId, isEditing }) => {
  const [showModal, setShowModal] = useState(false);
  const [showViewSubscriptionModal, setShowViewSubscriptionModal] = useState(false);
  const [subscriptionToView, setSubscriptionToView] = useState<any>(null);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<any>(null);
  const [plansOptions, setPlansOptions] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<any>(null);
  
  const {
    subscriptions,
    createSubscription,
    fetchSubscriptionsByCustomer,
    deleteSubscription,
    updateSubscription,
  } = useClientSubscriptions();

  useEffect(() => {
    const fetchPlans = async () => {
      const service = new SubscriptionPlanService();
      const res = await service.getSubscriptionPlans();
      if (res && res.data) {
        setPlansOptions(res.data.map((plan: any) => ({
          label: plan.name,
          value: plan.subscription_plan_id
        })));
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (isEditing && clientId) {
      fetchSubscriptionsByCustomer(clientId);
    }
  }, [isEditing, clientId, fetchSubscriptionsByCustomer]);

  const handleAddSubscription = async (values: any) => {
    setLoading(true);
    setSubscriptionError(null);
    try {
      // Clonar valores para no mutar el original
      const dataToSend = { ...values };

      // Limpiar preferred_days si está vacío o no existe
      if (
        !dataToSend.delivery_preferences?.preferred_days ||
        dataToSend.delivery_preferences.preferred_days.length === 0
      ) {
        if (dataToSend.delivery_preferences) {
          delete dataToSend.delivery_preferences.preferred_days;
        }
      }

      await createSubscription({ ...dataToSend, customer_id: clientId });
      setShowModal(false);
      await fetchSubscriptionsByCustomer(clientId);
    } catch (err: any) {
      setSubscriptionError(err.message || "Error al agregar abono");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscription = (item: any) => {
    setSubscriptionToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (subscriptionToDelete) {
      await deleteSubscription(subscriptionToDelete.subscription_id);
      await fetchSubscriptionsByCustomer(clientId);
      setShowDeleteModal(false);
      setSubscriptionToDelete(null);
    }
  };

  const handleOpenEditSubscription = (item: any) => {
    setSubscriptionToEdit(item);
    setShowModal(true);
  };

  const handleEditSubscription = async (values: any) => {
    setLoading(true);
    setShowModal(true);
    setSubscriptionError(null);
    try {
      // Clonar valores para no mutar el original
      const dataToSend = { ...values };

      // Limpiar preferred_days si está vacío o no existe
      if (
        !dataToSend.delivery_preferences?.preferred_days ||
        dataToSend.delivery_preferences.preferred_days.length === 0
      ) {
        if (dataToSend.delivery_preferences) {
          delete dataToSend.delivery_preferences.preferred_days;
        }
      }

      // Limpiar el payload para enviar solo los campos que la API espera
      const cleaned = cleanSubscriptionPayload(dataToSend);
      console.log("Cleaned data to send:", cleaned);
      await updateSubscription(subscriptionToEdit.subscription_id, cleaned);
      setShowModal(false);
      setSubscriptionToEdit(null);
      await fetchSubscriptionsByCustomer(clientId);
    } catch (err: any) {
      setSubscriptionError(err.message || "Error al editar abono");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscription = (item: any) => {
    setSubscriptionToView(item);
    setShowViewSubscriptionModal(true);
  };

  if (!isEditing) return null;

  function cleanSubscriptionPayload(data: any) {
  return {
    subscription_plan_id: data.subscription_plan_id,
    end_date: data.end_date,
    status: data.status,
    notes: data.notes,
    delivery_preferences: data.delivery_preferences,
  };
}

  const initialValues = subscriptionToEdit
  ? {
      ...subscriptionToEdit,
      delivery_preferences: parseTimeRangeFields(
        subscriptionToEdit.delivery_preferences,
        [
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
        ]
      ),
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

      <ListItem
        items={subscriptions}
        columns={clientSubscriptionListColumns}
        getKey={item => item.subscription_id}
        content="abono"
        genere="M"
        onRemove={handleRemoveSubscription}
        onEdit={handleOpenEditSubscription}
        onView={handleViewSubscription}
      />

      <Modal
        isOpen={showViewSubscriptionModal}
        onClose={() => setShowViewSubscriptionModal(false)}
        title="Detalle del abono"
        config={clientSubscriptionModalConfig}
        data={subscriptionToView}
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