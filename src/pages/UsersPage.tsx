import React, { useEffect, useState } from "react";
import UserForm from "../components/users/UserForm";
import UserList from "../components/users/UserList";
import UserDetailModal from "../components/users/UserDetailModal";
import { User, CreateUserDTO } from "../interfaces/User";
import { UserService } from "../services/UserService";
import { BackButton } from "../components/common/ActionButtons";

const userService = new UserService();

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
    const response = await userService.getUsers();
    setUsers(response.data);
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

  const handleBack = () => {
    setEditingUser(null);
    setShowForm(false);
  };

  return (
    <div className="relative overflow-hidden min-h-[400px] h-full p-4">
      <div>
        <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      </div>

      <div>
      {/* FORMULARIO */}
      <div
        className={`absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out z-10 bg-white p-4 shadow-lg rounded-lg
        ${showForm ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mt-4">
          <BackButton onClick={handleBack} />
        </div>
        <UserForm
          initialValues={
            editingUser ? { ...editingUser } : { ...emptyUser, password: "" }
          }
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isEditing={!!editingUser}
        />
        
      </div>

      {/* LISTA */}
      <div
        className={`absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out
        ${showForm ? "-translate-x-full" : "translate-x-0"}`}
      >
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Nuevo Usuario
        </button>

        <UserList
          users={users}
          onEdit={(user) => {
            setEditingUser(user);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          onView={setSelectedUser}
        />

        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      </div>
      </div>
    </div>
  );
};

export default UsersPage;
