// Formatea CUIT/CUIL en tiempo real al patrón 2-8-1: XX-XXXXXXXX-X
export function formatCUIT(input: string): string {
  if (!input) return "";
  const digits = String(input).replace(/\D/g, "").slice(0, 11); // máximo 11 dígitos
  const a = digits.slice(0, 2);
  const b = digits.slice(2, 10);
  const c = digits.slice(10, 11);

  if (digits.length <= 2) return a;
  if (digits.length <= 10) return `${a}-${b}`;
  return `${a}-${b}-${c}`;
}