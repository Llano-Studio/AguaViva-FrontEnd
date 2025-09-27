export function formatDateTimeForView(input: Date | string | number): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}