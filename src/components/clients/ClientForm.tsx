import React, { useState, useMemo, useEffect, useRef } from "react";
import { CreateClientDTO, Client, ClientType } from "../../interfaces/Client";
import { ItemForm } from "../common/ItemForm";
import { clientFields } from "../../config/clients/clientFieldsConfig";
import useClients from "../../hooks/useClients";
import { useDependentLocationFields } from "../../hooks/useDependentLocationFields";
import { useForm } from "react-hook-form";
import { getDependentLocationOptions, handleDependentLocationChange } from "../../config/common/dependentLocationLogic";
import SubscriptionClient from "./SubscriptionClient";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import { formatDateForInput } from "../../utils/formatDateForInput";
import ClientComodato from "./ClientComodato";
import { formatCUIT } from "../../utils/formatCUIT";
import ClientSubscriptionForm from "./ClientSubscriptionForm";
import { SubscriptionPlanService } from "../../services/SubscriptionPlanService";
import useClientSubscriptions from "../../hooks/useClientSubscriptions";
import "../../styles/css/components/clients/clientForm.css";

interface ClientFormProps {
  onCancel: () => void;
  isEditing: boolean;
  clientToEdit?: Client | null;
  refreshClients: () => Promise<void>;
  class?: string;
  onSuccess?: (msg: string) => void;
}

const getInitialValues = (isEditing: boolean, clientToEdit?: Client | null): CreateClientDTO => {
  if (isEditing && clientToEdit) {
    return {
      name: clientToEdit.name,
      phone: clientToEdit.phone,
      additionalPhones: clientToEdit.additionalPhones,
      address: clientToEdit.address,
      alias: clientToEdit.alias,
      taxId: clientToEdit.taxId,
      countryId: clientToEdit.locality?.province?.country?.country_id ?? 0,
      provinceId: clientToEdit.locality?.province?.province_id ?? 0,
      localityId: clientToEdit.locality?.locality_id ?? 0,
      zoneId: clientToEdit.zone?.zone_id ?? 0,
      registrationDate: formatDateForInput(clientToEdit.registration_date),
      type: clientToEdit.type,
      notes: clientToEdit.notes || "",
      is_active: clientToEdit.is_active
    };
  }
  return {
    name: "",
    phone: "",
    additionalPhones: "",
    address: "",
    alias: "",
    taxId: "",
    countryId: 0,
    provinceId: 0,
    localityId: 0,
    zoneId: 0,
    registrationDate: new Date().toISOString().split('T')[0],
    type: ClientType.PLAN,
    notes: "",
    is_active: true
  };
};

const ClientForm: React.FC<ClientFormProps> = ({
  onCancel,
  isEditing,
  clientToEdit,
  refreshClients,
  class: classForm,
  onSuccess,
}) => {
  const { createClient, updateClient } = useClients();
  const { createSubscription } = useClientSubscriptions();
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  // Estado para el modal de confirmación de actualización
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateClientDTO | null>(null);

  // Memoiza los valores iniciales
  const initialValues = useMemo(
    () => getInitialValues(isEditing, clientToEdit),
    [isEditing, clientToEdit]
  );

  // Hook para selects dependientes
  const {
    countries,
    provinces,
    localities,
    zones,
  } = useDependentLocationFields();

  // React Hook Form
  const form = useForm<CreateClientDTO>({
    defaultValues: initialValues
  });

  const { watch, setValue, handleSubmit: hookHandleSubmit, getValues, trigger } = form;

  // Watch
  const watchedCountry = watch("countryId");
  const watchedProvince = watch("provinceId");
  const watchedLocality = watch("localityId");
  const watchedType = watch("type");
  const isPlan = watchedType === ClientType.PLAN;

  // Opciones dependientes
  const {
    countryOptions,
    provinceOptions,
    localityOptions,
    zoneOptions
  } = getDependentLocationOptions(
    countries,
    provinces,
    localities,
    zones,
    watchedCountry,
    watchedProvince,
    watchedLocality
  );

  // Handler reutilizable
  const handleFieldChange = handleDependentLocationChange<CreateClientDTO>(setValue);

  const handleClientFieldChange = (fieldName: keyof CreateClientDTO, value: any) => {
    if (fieldName === "taxId") {
      const formatted = formatCUIT(String(value ?? ""));
      setValue("taxId", formatted, { shouldValidate: true, shouldDirty: true });
      return;
    }
    handleFieldChange(fieldName, value);
  };

  // Submit handler (edición igual; alta individual normal)
  const handleSubmit = async (values: CreateClientDTO | FormData) => {
    if (isEditing && clientToEdit) {
      setPendingValues(values as CreateClientDTO);
      setShowUpdateConfirm(true);
      return;
    }
    // Alta individual (cuando no es PLAN)
    try {
      let dataToSend: any = values;
      if (!(values instanceof FormData)) {
        const {
          name,
          phone,
          additionalPhones,
          address,
          alias,
          taxId,
          localityId,
          zoneId,
          registrationDate,
          type,
          is_active,
          notes
        } = values as CreateClientDTO;

        dataToSend = {
          name,
          phone,
          additionalPhones,
          address,
          alias,
          taxId,
          localityId,
          zoneId,
          registrationDate,
          type,
          is_active,
          notes
        };
      }
      const newClient = await createClient(dataToSend);
      if (newClient) {
        await refreshClients();
        if (onSuccess) onSuccess("Cliente creado correctamente.");
        showSnackbar("Cliente creado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar el cliente");
        showSnackbar("Error al guardar el cliente", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar el cliente");
      showSnackbar(err?.message || "Error al guardar el cliente", "error");
      console.error(err);
    }
  };

  // Confirmación de edición (sin cambios)
  const handleConfirmUpdate = async () => {
    if (!pendingValues || !clientToEdit) return;
    try {
      let dataToSend: any = pendingValues;
      if (!(pendingValues instanceof FormData)) {
        const {
          name,
          phone,
          additionalPhones,
          address,
          alias,
          taxId,
          localityId,
          zoneId,
          registrationDate,
          type,
          is_active,
          notes
        } = pendingValues as CreateClientDTO;

        dataToSend = {
          name,
          phone,
          additionalPhones,
          address,
          alias,
          taxId,
          localityId,
          zoneId,
          registrationDate,
          type,
          is_active,
          notes
        };
      }
      const updatedClient = await updateClient(clientToEdit.person_id, dataToSend);
      if (updatedClient) {
        await refreshClients();
        if (onSuccess) onSuccess("Cliente editado correctamente.");
        showSnackbar("Cliente editado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al actualizar el cliente");
        showSnackbar("Error al actualizar el cliente", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al actualizar el cliente");
      showSnackbar(err?.message || "Error al actualizar el cliente", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  // --- Alta con PLAN: formulario de suscripción integrado ---
  const [plansOptions, setPlansOptions] = useState<{ label: string; value: number }[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const triggerReload = () => {setReloadFlag((f) => f + 1);};

  useEffect(() => {
    if (!isEditing) {
      const fetchPlans = async () => {
        try {
          const service = new SubscriptionPlanService();
          const res = await service.getSubscriptionPlans();
          if (res?.data) {
            setPlansOptions(
              res.data.map((plan: any) => ({
                label: plan.name,
                value: plan.subscription_plan_id,
              }))
            );
          }
        } catch {
          setPlansOptions([]);
        }
      };
      fetchPlans();
    }
  }, [isEditing]);

  // Refs para gestión del form de suscripción
  const subFormContainerRef = useRef<HTMLDivElement>(null);
  const subSubmitResolverRef = useRef<((ok: boolean) => void) | null>(null);
  const lastCreatedClientIdRef = useRef<number | null>(null);
  const selectedPlanIdRef = useRef<number | "" | null>(null); // almacena el plan seleccionado

  // onSubmit del ClientSubscriptionForm (se ejecuta al forzar submit)
  const handleSubscriptionSubmit = async (values: any) => {
    if (!lastCreatedClientIdRef.current) {
      subSubmitResolverRef.current?.(false);
      return;
    }
    setSubLoading(true);
    setSubError(null);
    try {
      const payload = {
        ...values,
        customer_id: lastCreatedClientIdRef.current,
      };
      if (!payload.delivery_preferences?.preferred_days || payload.delivery_preferences.preferred_days.length === 0) {
        if (payload.delivery_preferences) delete payload.delivery_preferences.preferred_days;
      }

      await createSubscription(payload);
      subSubmitResolverRef.current?.(true);
    } catch (e: any) {
      const msg = e?.message || "Error al crear abono";
      setSubError(msg);
      showSnackbar(msg, "error");
      subSubmitResolverRef.current?.(false);
    } finally {
      setSubLoading(false);
    }
  };

  // Guardar combinado: crea cliente y luego la suscripción SOLO si hay plan seleccionado
  const handleSaveWithSubscription = async () => {
    try {
      setError(null);
      const valid = await trigger();
      if (!valid) return;

      const values = getValues();
      const {
        name, phone, additionalPhones, address, alias, taxId,
        localityId, zoneId, registrationDate, type, is_active, notes
      } = values;

      const clientPayload: any = {
        name, phone, additionalPhones, address, alias, taxId,
        localityId, zoneId, registrationDate, type, is_active, notes
      };

      // 1) Crear cliente primero
      const newClient: any = await createClient(clientPayload);
      const newClientId =
        newClient?.person_id ??
        newClient?.data?.person_id ??
        newClient?.client_id ??
        null;

      if (!newClientId) {
        showSnackbar("No se pudo obtener el ID del cliente creado.", "error");
        return;
      }
      lastCreatedClientIdRef.current = Number(newClientId);

      // 2) Ver si hay plan seleccionado (sin querySelector; valor provisto por el form hijo)
      const planId = selectedPlanIdRef.current;
      const hasPlanSelected =
        planId !== null && String(planId).trim() !== "" && !Number.isNaN(Number(planId));

      // Si NO hay plan seleccionado: terminar con creación de cliente solamente
      if (!hasPlanSelected) {
        await refreshClients();
        if (onSuccess) onSuccess("Cliente creado correctamente.");
        showSnackbar("Cliente creado correctamente.", "success");
        onCancel();
        return;
      }

      // 3) Si HAY plan seleccionado: forzar submit del formulario de suscripción
      const formEl: HTMLFormElement | null =
        subFormContainerRef.current?.querySelector("form") || null;

      if (!formEl) {
        showSnackbar("Complete los datos del abono antes de guardar.", "error");
        return;
      }

      const submitPromise = new Promise<boolean>((resolve) => {
        subSubmitResolverRef.current = resolve;
      });

      formEl.requestSubmit();

      const ok = await submitPromise;

      if (ok) {
        await refreshClients();
        if (onSuccess) onSuccess("Cliente y abono creados correctamente.");
        showSnackbar("Cliente y abono creados correctamente.", "success");
        onCancel();
      } else {
        showSnackbar("El cliente fue creado, pero el abono no pudo crearse.", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar el cliente y abono");
      showSnackbar(err?.message || "Error al guardar el cliente y abono", "error");
      console.error(err);
    } finally {
      subSubmitResolverRef.current = null;
      lastCreatedClientIdRef.current = null;
    }
  };

  return (
    <>
      {/* CSS para ocultar acciones internas de formularios cuando es PLAN */}
      {isPlan && (
        <style>{`
          /* Oculta contenedores de acciones comunes en forms internos */
          .hide-inner-form-actions form .form-actions,
          .hide-inner-form-actions .item-form-actions,
          .hide-inner-form-actions form button[type="submit"],
          .hide-inner-form-actions button.form-submit {
            display: none !important;
          }
        `}</style>
      )}

      {/* ItemForm: si es PLAN, ocultar botones internos y deshabilitar submit nativo */}
      <div className={isPlan && !isEditing ? "hide-inner-form-actions" : undefined}>
        <ItemForm<CreateClientDTO>
          {...form}
          onSubmit={isPlan && !isEditing ? (() => {}) : handleSubmit}
          onCancel={onCancel}
          fields={clientFields(countryOptions, provinceOptions, localityOptions, zoneOptions)}
          class={classForm}
          onFieldChange={(fieldName, value) =>
            handleClientFieldChange(fieldName as keyof CreateClientDTO, value)
          }
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Modo edición (sin cambios) */}
      {isEditing && clientToEdit && (
        <>
          <SubscriptionClient
            clientId={clientToEdit.person_id}
            isEditing={isEditing}
            reloadFlag={reloadFlag}
            triggerReload={triggerReload}
          />
          <ClientComodato
            clientId={clientToEdit.person_id}
            isEditing={isEditing}
            reloadFlag={reloadFlag}
            triggerReload={triggerReload}
          />
        </>
      )}

      {/* Alta con PLAN: mostrar formulario de suscripción y solo botones externos */}
      {!isEditing && isPlan && (
        <div style={{ marginTop: 24 }} className="hide-inner-form-actions-suscription">
          <h3 className="suscription-client-title">Abono del cliente</h3>

          {/* Ocultar acciones internas del ClientSubscriptionForm */}
          <div ref={subFormContainerRef} className="hide-inner-form-actions">
            <ClientSubscriptionForm
              initialValues={undefined}
              onSubmit={handleSubscriptionSubmit}
              onCancel={() => {}}
              plansOptions={plansOptions}
              loading={subLoading}
              error={subError}
              isEditing={false}
              onPlanChange={(pid) => {
                // guardar el plan seleccionado reportado por el form hijo
                selectedPlanIdRef.current =
                  pid === "" || pid === null ? (pid as "" | null) : Number(pid);
              }}
            />
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button type="button" className="form-cancel" onClick={onCancel}>
              Cancelar
            </button>
            <button
              type="button"
              className="form-submit"
              onClick={handleSaveWithSubscription}
              disabled={subLoading}
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="cliente"
        genere="M"
      />
    </>
  );
};

export default ClientForm;