import React from "react";
import "../../styles/css/components/common/switch.css";

interface SwitchProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: [T, T]; // Ejemplo: ["sumar", "restar"]
  labels?: [string, string]; // Ejemplo: ["Sumar", "Restar"]
}

export const Switch = <T extends string = string>({
  value,
  onChange,
  options,
  labels,
}: SwitchProps<T>) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
    <span style={{ fontWeight: value === options[0] ? "bold" : "normal" }}>
      {labels ? labels[0] : options[0]}
    </span>
    <label className="switch">
      <input
        type="checkbox"
        checked={value === options[1]}
        onChange={() => onChange(value === options[0] ? options[1] : options[0])}
      />
      <span className="slider round"></span>
    </label>
    <span style={{ fontWeight: value === options[1] ? "bold" : "normal" }}>
      {labels ? labels[1] : options[1]}
    </span>
  </div>
);

export default Switch;