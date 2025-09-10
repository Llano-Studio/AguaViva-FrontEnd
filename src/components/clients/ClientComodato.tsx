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
}

const ClientComodato: React.FC<ClientComodatoProps> = ({ clientId, isEditing }) => {
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
  }, [isEditing, clientId, fetchPersonComodatos]);

  const handleOpenNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setErr(null);
    try {
      if (editingItem) {
        await updateComodato(clientId, editingItem.comodato_id, values);
        showSnackbar("Comodato actualizado correctamente.", "success");
      } else {
        await createComodato(clientId, { ...values, person_id: clientId });
        showSnackbar("Comodato creado correctamente.", "success");
      }
      setShowModal(false);
      setEditingItem(null);
      await fetchPersonComodatos(clientId);
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