export const sortByOrder = <T extends { order?: number }>(array: T[]): T[] => {
  return array.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};