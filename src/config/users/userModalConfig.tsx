import React from "react";
import ImageProfile from "../../components/common/ImageProfile";
import { sortByOrder } from "../../utils/sortByOrder";

export const userModalConfig = sortByOrder([
  {
    label: "",
    accessor: "profileImageUrl",
    className: "modal-item-image",
    order: 1,
    render: (value: string) =>
      <ImageProfile 
        src={value}
        alt="Imagen de perfil"
        style={{ width: 180, height: 180, borderRadius: "6px", objectFit: "cover" }}
      />
  },
  {
    label: "Nombre",
    accessor: "name",
    className: "modal-item-1",
    order: 2,
  },
  {
    label: "Email",
    accessor: "email",
    className: "modal-item-2",
    order: 3,
  },
  {
    label: "Rol",
    accessor: "role",
    className: "modal-item-3",
    order: 4,
    render: (value: string) => value === "ADMIN" ? "Administrador" : "Usuario",
  },
  {
    label: "Estado",
    accessor: "isActive",
    className: "modal-item-4",
    order: 5,
    render: (value: boolean) => value ? "Activo" : "Inactivo",
  },
]);