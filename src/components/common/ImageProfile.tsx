import React from "react";

interface ImageProfileProps {
  src?: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
}

const ImageProfile: React.FC<ImageProfileProps> = ({ src, alt, style, className }) => (
  <img
    src={src ? src : "/assets/imagenes/profile-img.png"}
    alt={alt ? alt : "Imagen de perfil"}
    className={className}
    style={style}
  />
);

export default ImageProfile;