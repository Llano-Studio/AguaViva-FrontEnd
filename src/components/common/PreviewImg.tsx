import React, { useState } from "react";

interface PreviewImgProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
  clickable?: boolean;
  href?: string; // si no viene, usa src
}

const PreviewImg: React.FC<PreviewImgProps> = ({
  src,
  alt = "Imagen",
  width = 120,
  height = 120,
  borderRadius = 6,
  className,
  style,
  clickable = true,
  href,
}) => {
  const [error, setError] = useState(false);

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
    padding: 0,
    margin: 0,
    ...style,
  };

  const content = error ? (
    <div style={{ textAlign: "center", color: "#6b7280", padding: 0, margin: 0 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#9ca3af" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14l2-2h14l2 2z"/>
        <circle cx="8" cy="9" r="2" fill="#f3f4f6"/>
      </svg>
      <div style={{ fontSize: 12, marginTop: 6 }}>Vista previa no disponible</div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setError(true)}
    />
  );

  return (
    <div className={className} style={wrapperStyle} title={alt}>
      {content}
      {clickable && (
        <a
          href={href || src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir en nueva pestaña"
          style={{ position: "absolute", inset: 0 }}
        />
      )}
    </div>
  );
};

export default PreviewImg;