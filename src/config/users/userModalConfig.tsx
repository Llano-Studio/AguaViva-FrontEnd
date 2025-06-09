import React from "react";

export const userModalConfig = [
  {
    label: "Imagen de perfil",
    accessor: "profileImageUrl",
    className: "modal-item-image",
    order: 1,
    render: (value: string) =>
      value ? (
        <img
          src={value}
          alt="Imagen de perfil"
          style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        "Sin imagen"
      ),
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
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));