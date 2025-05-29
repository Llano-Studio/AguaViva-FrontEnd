import React from "react";

interface ModalDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  content: string; // Ej: "usuario", "zona", "pedido"
  genere: "M" | "F"; // "M" para masculino, "F" para femenino
}

const ModalDelete: React.FC<ModalDeleteProps> = ({
  isOpen,
  onClose,
  onDelete,
  content,
  genere,
}) => {
  if (!isOpen) return null;

  const articulo = genere === "M" ? "este" : "esta";
  const eliminar = `eliminar ${content}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4 text-red-600 capitalize">{eliminar}</h2>
        <p className="mb-2">
          ¿Quieres eliminar {articulo} {content}?
        </p>
        <p className="mb-6">
          Al eliminar {articulo} {content} se perderán los datos ingresados
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white capitalize"
          >
            {eliminar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDelete;