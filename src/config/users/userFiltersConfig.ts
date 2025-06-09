export const userFilters = [
  {
    name: "role",
    label: "Rol",
    type: "checkbox",
    order: 1,
    options: [
      { label: "Usuario", value: "USER" },
      { label: "Administrador", value: "ADMIN" },
    ],
  },
  {
    name: "isActive",
    label: "Activo",
    type: "checkbox",
    order: 2,
    options: [
      { label: "Sí", value: "true" },
      { label: "No", value: "false" },
    ],
  },
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));