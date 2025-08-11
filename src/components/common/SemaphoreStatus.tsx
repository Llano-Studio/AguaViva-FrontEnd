import React from "react";

interface SemaphoreStatusProps<T> {
  value: T;
  colorMap: Record<string, string>; // Ej: { GREEN: "#22c55e", YELLOW: "#eab308", RED: "#ef4444", NONE: "#9ca3af" }
  children: React.ReactNode;
  active: boolean;
}

export function getSemaphoreStyle({
  value,
  colorMap,
  active,
}: {
  value: string;
  colorMap: Record<string, string>;
  active: boolean;
}) {
  const background = active && value && colorMap[value] ? colorMap[value] : undefined;
  return background ? { background } : {};
}