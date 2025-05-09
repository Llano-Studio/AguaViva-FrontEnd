import React, { useEffect, useState } from "react";
import { ItemList } from "../components/ItemList";
import { ItemForm, Field } from "../components/ItemForm";
import { User, CreateUserDTO } from "../interfaces/User";
import { UserService } from "../services/UserService";

const userService = new UserService();

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);

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
      const { name, email, role, isActive } = user;
      await userService.updateUser(user.id, { name, email, role, isActive });
    }

    setEditingUser(null);
    setShowForm(false);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    await userService.deleteUser(id);
    fetchUsers();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const baseFields: Field<User>[] = [
    { name: "name", label: "Nombre", validation: { required: true } },
    { name: "email", label: "Email", type: "email", validation: { required: true, isEmail: true } },
    { name: "role", label: "Rol", validation: { required: true } },
    { name: "isActive", label: "Activo", type: "checkbox" },
  ];

  const fields: Field<User & { password?: string }>[] = editingUser?.id
    ? baseFields
    : [
        ...baseFields,
        {
          name: "password",
          label: "Contraseña",
          type: "password",
          validation: { required: true, minLength: 6 },
        },
      ];

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Gestión de Usuarios</h1>

      <button onClick={handleNewUser} style={{ marginBottom: "1rem" }}>
        Nuevo Usuario
      </button>

      {showForm && (
        <ItemForm<User & { password?: string }>
          initialValues={
            editingUser ? { ...editingUser } : { ...emptyUser, password: "" }
          }
          onSubmit={handleSubmit}
          fields={fields}
        />
      )}

      <hr style={{ margin: "2rem 0" }} />

      <ItemList<User>
        items={users}
        itemType="usuario"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default UsersPage;
