import React, { useEffect, useState } from "react";
import { ListItem } from "../common/ListItem";
import { Modal } from "../common/Modal";
import ModalDeleteConfirm from "../common/ModalDeleteConfirm";
import { clientComodatoListColumns } from "../../config/clients/clientComodatoListColumns";
import { clientComodatoModalConfig } from "../../config/clients/clientComodatoModalConfig";
import ModalClientComodato from "./ModalClientComodato";
import useClients from "../../hooks/useClients";
import { useSnackbar } from "../../context/SnackbarContext";
import "../../styles/css/components/clients/clientComodato.css";

interface ClientComodatoProps {
  clientId: number;
  isEditing: boolean;
  reloadFlag?: number;
  triggerReload?: () => void;
}

const ClientComodato: React.FC<ClientComodatoProps> = ({ clientId, isEditing, reloadFlag, triggerReload }) => {
  const { showSnackbar } = useSnackbar();
  const {
    comodatos,
    fetchPersonComodatos,
    createComodato,
    updateComodato,
    deleteComodato,
  } = useClients();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  useEffect(() => {
    if (!isEditing || !clientId) return;
    (async () => {
      try {
        setLoading(true);
        await fetchPersonComodatos(clientId);
      } catch (e: any) {
        setErr(e?.message || "Error al cargar comodatos");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEditing, clientId, reloadFlag]);

  const handleOpenNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const toYMD = (v: any) => (v ? String(v).slice(0, 10) : "");
  const toNum = (v: any) => (v === undefined || v === null || String(v).trim() === "" ? undefined : Number(v));
  const getFD = (fd: FormData, k: string) => {
    const v = fd.get(k);
    return v == null ? undefined : String(v);
  };
  const stripUndefined = (obj: Record<string, any>) => {
    const o: Record<string, any> = {};
    Object.keys(obj).forEach((k) => {
      const v = (obj as any)[k];
      if (v !== undefined) o[k] = v;
    });
    return o;
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setErr(null);
    try {
      if (editingItem) {
        // Editar: siempre enviar FormData (con o sin imagen)
        let fd: FormData;
        if (values instanceof FormData) {
          fd = values;
        } else {
          fd = new FormData();
          Object.entries(values || {}).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            if (v instanceof Blob) fd.set(k, v);
            else fd.set(k, String(v));
          });
        }

        // Limpieza y mínimos
        fd.delete("contract_image_path");
        const ymd = (d: any) => (d ? String(d).slice(0, 10) : "");
        const get = (k: string) => {
          const v = fd.get(k);
          return v == null ? "" : String(v);
        };
        if (!fd.has("product_id")) fd.set("product_id", get("product_id"));
        if (!fd.has("quantity")) fd.set("quantity", get("quantity"));
        if (!fd.has("delivery_date")) fd.set("delivery_date", ymd(get("delivery_date")));
        if (!fd.has("expected_return_date")) fd.set("expected_return_date", ymd(get("expected_return_date")));
        if (!fd.has("status")) fd.set("status", get("status"));

        await updateComodato(clientId, editingItem.comodato_id, fd as any);
        showSnackbar("Comodato actualizado correctamente.", "success");
      } else {
        // Crear: siempre FormData
        let payload: FormData;
        if (values instanceof FormData) {
          payload = values;
        } else {
          payload = new FormData();
          Object.entries(values || {}).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            if (v instanceof Blob) payload.set(k, v);
            else payload.set(k, String(v));
          });
        }
        payload.set("person_id", String(clientId));
        payload.delete("contract_image_path");

        await createComodato(clientId, payload);
        showSnackbar("Comodato creado correctamente.", "success");
      }
      setShowModal(false);
      setEditingItem(null);
      await fetchPersonComodatos(clientId);
      if (triggerReload) triggerReload();
    } catch (e: any) {
      const msg = e?.message || "Error al guardar el comodato";
      setErr(msg);
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = (item: any) => {
    setToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteComodato(clientId, toDelete.comodato_id);
      await fetchPersonComodatos(clientId);
      showSnackbar("Comodato eliminado correctamente.", "success");
      if (triggerReload) triggerReload();
    } catch (e: any) {
      showSnackbar(e?.message || "Error al eliminar el comodato", "error");
    } finally {
      setShowDeleteModal(false);
      setToDelete(null);
    }
  };

  if (!isEditing) return null;

  return (
    <div className="clientComodato-actions-container">
      <div className="clientComodato-actions-title">
        <h2 className="clientComodato-title">Comodatos del cliente</h2>
        <button onClick={handleOpenNew} className="page-new-button clientComodato-new-button">
          <img src="/assets/icons/huge-icon.svg" alt="Agregar comodato" className="page-new-button-icon" />
          Agregar Comodato
        </button>
      </div>

      <ModalClientComodato
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        initialValues={editingItem || undefined}
        loading={loading}
        error={err || undefined}
        isEditing={Boolean(editingItem)}
      />

      <ListItem
        items={comodatos}
        columns={clientComodatoListColumns}
        getKey={(i) => i.comodato_id}
        content="comodato"
        genere="M"
        onRemove={handleRemove}
        onEdit={(i) => { setEditingItem(i); setShowModal(true); }}
        onView={(i) => setViewItem(i)}
      />

      <Modal
        isOpen={Boolean(viewItem)}
        onClose={() => setViewItem(null)}
        title="Detalle del comodato"
        config={clientComodatoModalConfig}
        data={viewItem}
      />

      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setToDelete(null); }}
        onDelete={handleConfirmDelete}
        content="comodato"
        genere="M"
      />
    </div>
  );
};

export default ClientComodato;