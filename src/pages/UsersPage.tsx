import React, { useEffect, useState } from "react";
import { ItemList } from "../components/ItemList";
import { ItemForm } from "../components/ItemForm";
import { User, CreateUserDTO } from "../interfaces/User";
import { UserService } from "../services/UserService";
import { Field } from "../components/ItemForm"; // Importa el tipo Field desde ItemForm.tsx

const userService = new UserService();

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const emptyUser: User = {
    id: 0,
    name: "",
    email: "",
    role: "USER",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  };

  const fetchUsers = async () => {
    const data = await userService.getUsers();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (user: User & { password?: string }) => {
    if (user.id === 0) {
      // Validar password
      if (!user.password || user.password.trim() === "") {
        alert("La contraseña es obligatoria para nuevos usuarios.");
        return;
      }

      const newUser: CreateUserDTO = {
        name: user.name,
        email: user.email,
        password: user.password,
      };

      await userService.createUser(newUser);
    } else {
      await userService.updateUser(user.id, user);
    }

    setEditingUser(null);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    await userService.deleteUser(id);
    fetchUsers();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  // Definir los campos comunes
  const baseFields: Field<User>[] = [
    { name: "name", label: "Nombre" },
    { name: "email", label: "Email", type: "email" },
    { name: "role", label: "Rol" },
    { name: "isActive", label: "Activo", type: "checkbox" },
  ];

  // Si es nuevo usuario, incluir campo contraseña
  const fields: Field<User & { password?: string }>[] = editingUser?.id
    ? baseFields
    : [
        ...baseFields,
        { name: "password", label: "Contraseña", type: "password" },
      ];

  return (
    <div>
      <h1>Gestión de Usuarios</h1>

      <ItemForm<User & { password?: string }>
        initialValues={editingUser || { ...emptyUser, password: "" }}
        onSubmit={handleSubmit}
        fields={fields}
      />

      <hr />

      <ItemList<User>
        items={users}
        itemType="usuario"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
