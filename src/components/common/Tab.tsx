import React from "react";
import "../../styles/css/components/common/tab.css";

export interface TabOption {
  key: string;
  label: React.ReactNode;
}

interface TabProps {
  options: TabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Tab: React.FC<TabProps> = ({
  options,
  activeKey,
  onChange,
  className,
  style,
}) => (
  <div className={`tab-container ${className ?? ""}`} style={style}>
    {options.map(tab => (
      <button
        key={tab.key}
        type="button"
        className={`tab-button${activeKey === tab.key ? " active" : ""}`}
        onClick={() => onChange(tab.key)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default Tab;