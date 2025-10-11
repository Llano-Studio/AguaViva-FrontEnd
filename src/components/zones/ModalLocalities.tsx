import React, { useState, useEffect } from "react";
import useLocations from "../../hooks/useLocations";
import { DataTable } from "../../components/common/DataTable";
import LocalityForm from "./LocalityForm";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import { Modal } from "../common/Modal";
import { localityColumns } from "../../config/zones/localityFieldsConfig";
import "../../styles/css/components/zones/modalLocalities.css";
import SpinnerLoading from "../common/SpinnerLoading";

interface ModalLocalitiesProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalLocalities: React.FC<ModalLocalitiesProps> = ({ isOpen, onClose }) => {
  const {
    localities,
    fetchLocalities,
    deleteLocality,
    isLoading,
    error,
  } = useLocations();

  const [showForm, setShowForm] = useState(false);
  const [editingLocality, setEditingLocality] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localityToDelete, setLocalityToDelete] = useState<any>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (isOpen) {
      fetchLocalities();
    }
  }, [isOpen, fetchLocalities]);

  const handleEdit = (locality: any) => {
    setEditingLocality(locality);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    const original = localities.find(loc => loc.locality_id === id);
    setLocalityToDelete(original || null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (localityToDelete) {
      try {
        await deleteLocality(localityToDelete.locality_id);
        showSnackbar("Localidad eliminada correctamente.", "success");
        fetchLocalities();
      } catch (err: any) {
        showSnackbar(err?.message || "Error al eliminar localidad", "error");
      } finally {
        setShowDeleteModal(false);
        setLocalityToDelete(null);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Localidades">
      <div className="modalLocalities-container">
        <button
          onClick={() => { setEditingLocality(null); setShowForm(true); }}
          className="modalLocalities-add-locality-button"
        >
          Agregar Localidad
        </button>
        {showForm && (
          <LocalityForm
            onCancel={() => setShowForm(false)}
            isEditing={!!editingLocality}
            localityToEdit={editingLocality}
            refreshLocalities={fetchLocalities}
          />
        )}
        <DataTable
          data={localities.map(loc => ({ ...loc, id: loc.locality_id }))}
          columns={localityColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <ModalDeleteConfirm
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleConfirmDelete}
          content="localidad"
          genere="F"
        />
        {error && <div className="error-message">{error}</div>}
        {isLoading && <div className="p-4 container-loading"><SpinnerLoading /></div>}
      </div>
    </Modal>
  );
};

export default ModalLocalities;