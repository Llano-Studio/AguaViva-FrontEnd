export const typeOrderLabels: Record<string, string> = {
  HYBRID: "Regular",
  ONE_OFF: "Compra Única",
};

export const renderTypeOrderLabel = (value: string) => typeOrderLabels[value] || value;