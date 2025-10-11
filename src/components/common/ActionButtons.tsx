import IconButton from "./IconButton";

export const BackButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/back.svg" alt="Volver" tooltip="Volver" />
);

export const EditButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/edit.svg" alt="Editar" tooltip="Editar" />
);

export const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/delete.svg" alt="Eliminar" tooltip="Eliminar" />
);

export const ViewButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/view.svg" alt="Ver" tooltip="Ver" />
);

export const DownloadButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/download.svg" alt="Descargar" tooltip="Descargar" />
);

export const CancelButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/cancel.svg" alt="Cancelar" tooltip="Cancelar" />
);

export const PaymentButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/payment.svg" alt="Pagos" tooltip="Pagos" />
);

export const UndoActionButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} icon="/assets/icons/backActions.svg" alt="Deshacer" tooltip="Deshacer" />
);


