import React from "react";

interface PreviewPDFProps {
  href: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

const PreviewPDF: React.FC<PreviewPDFProps> = ({
  href,
  width = 120,
  height = 120,
  borderRadius = 6,
  className,
  style,
  label = "Ver PDF",
}) => {
  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width,
    height,
    borderRadius,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    margin: 0,
    padding: 0,
    ...style,
  };

  return (
    <div className={className} style={wrapperStyle} title="Contrato (PDF)">
      <div style={{ textAlign: "center", margin: 0, padding: 0 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#ef4444" d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path fill="#fff" d="M14 2v6h6" />
          <rect x="6.5" y="14" width="11" height="1.8" rx=".9" fill="#fff" />
          <text x="12" y="13" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">PDF</text>
        </svg>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6, marginBottom: 0, padding: 0 }}>{label}</div>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir PDF en nueva pestaña"
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
};

export default PreviewPDF;