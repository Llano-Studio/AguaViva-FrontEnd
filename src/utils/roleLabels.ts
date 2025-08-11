export const roleLabels: Record<string, string> = {
  ADMINISTRATIVE: "Administrativo",
  SUPERADMIN: "Superadministrador",
  DRIVERS: "Chofer",
};

export const renderRoleLabel = (value: string) => roleLabels[value] || value;