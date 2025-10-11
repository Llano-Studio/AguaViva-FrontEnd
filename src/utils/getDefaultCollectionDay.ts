export function getDefaultCollectionDay(date: Date = new Date()): number {
  const day = date.getDate();
  return day > 28 ? 1 : day;
}