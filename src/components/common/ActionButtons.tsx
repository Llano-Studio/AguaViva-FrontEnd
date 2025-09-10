import IconButton from "./IconButton";

export const BackButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/back.svg" alt="Volver" />
);

export const EditButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/edit.svg" alt="Editar" />
);

export const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/delete.svg" alt="Eliminar" />
);

export const ViewButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/view.svg" alt="Ver" />
);

export const DownloadButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/download.svg" alt="Descargar PDF" />
);

export const CancelButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/cancel.svg" alt="Descargar PDF" />
);

export const PaymentButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/payment.svg" alt="Realizar Pago" />
);
