export const userFilters = [
  {
    name: "role",
    label: "Rol",
    type: "checkbox",
    options: [
      { label: "Usuario", value: "USER" },
      { label: "Administrador", value: "ADMIN" },
    ],
  },
  {
    name: "isActive",
    label: "Activo",
    type: "checkbox",
    options: [
      { label: "Sí", value: "true" },
      { label: "No", value: "false" },
    ],
  },
] as const;