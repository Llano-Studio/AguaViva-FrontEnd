import React from "react";
import { ItemList, DisplayField } from "../ItemList";
import { User } from "../../interfaces/User";

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onView: (user: User) => void;
};

const UserList: React.FC<Props> = ({ users, onEdit, onDelete, onView }) => {
  const displayFields: DisplayField<User>[] = [
    { label: "Nombre", field: "name" },
    { label: "Email", field: "email" },
    { label: "Rol", field: "role" },
    {
      label: "Activo",
      field: "isActive",
      render: (value) => (value ? "Sí" : "No"),
    },
  ];

  return (
    <ItemList
      items={users}
      itemType="usuario"
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
      displayFields={displayFields}
    />
  );
};

export default UserList;
