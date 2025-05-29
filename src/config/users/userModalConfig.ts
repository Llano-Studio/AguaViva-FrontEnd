export const userModalConfig = [
  {
    label: "Nombre",
    accessor: "name",
    className: "modal-item-1",
  },
  {
    label: "Email",
    accessor: "email",
    className: "modal-item-2",
  },
  {
    label: "Rol",
    accessor: "role",
    className: "modal-item-3",
    render: (value: string) => value === "ADMIN" ? "Administrador" : "Usuario",
  },
  {
    label: "Estado",
    accessor: "isActive",
    className: "modal-item-4",
    render: (value: boolean) => value ? "Activo" : "Inactivo",
  },
];