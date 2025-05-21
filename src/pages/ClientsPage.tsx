import React, { useEffect, useState } from "react";
import { ItemList, DisplayField } from "../components/ItemList";
import { ItemForm, Field } from "../components/ItemForm";
import { Client, CreateClientDTO, ClientType } from "../interfaces/Client";
import { ClientService } from "../services/ClientService";

const clientService = new ClientService();

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyClient: CreateClientDTO = {
    name: "",
    phone: "",
    address: "",
    taxId: "",
    localityId: 0,
    zoneId: 0,
    registrationDate: new Date().toISOString().slice(0, 10),
    type: ClientType.INDIVIDUAL,
  };

  const fetchClients = async () => {
    const response = await clientService.getClients();
    setClients(response.data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (client: Client) => {
    if (!client.name || client.name.trim() === "") {
      alert("El nombre es obligatorio.");
      return;
    }

    const localityIdNum = Number(client.localityId);
    const zoneIdNum = Number(client.zoneId);

    if (client.person_id) {
      const {
        name,
        phone,
        address,
        taxId,
        localityId,
        zoneId,
        registrationDate,
        type,
      } = client;
      await clientService.updateClient(client.person_id, {
        name,
        phone,
        address,
        taxId,
        localityId: localityIdNum,
        zoneId: zoneIdNum,
        registrationDate,
        type,
      });
    } else {
      const newClient: CreateClientDTO = {
        name: client.name,
        phone: client.phone,
        address: client.address,
        taxId: client.taxId,
        localityId: localityIdNum,
        zoneId: zoneIdNum,
        registrationDate: client.registrationDate,
        type: client.type,
      };
      await clientService.createClient(newClient);
    }

    setEditingClient(null);
    setShowForm(false);
    fetchClients();
  };

  const handleDelete = async (id: number) => {
    await clientService.deleteClient(id);
    fetchClients();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const fields: Field<Client>[] = [
    { name: "name", label: "Nombre", validation: { required: true } },
    { name: "phone", label: "Teléfono", validation: { required: true } },
    { name: "address", label: "Dirección", validation: { required: true } },
    { name: "taxId", label: "CUIT/CUIL", validation: { required: true } },
    {
      name: "localityId",
      label: "Localidad",
      type: "number",
      validation: { required: true },
    },
    {
      name: "zoneId",
      label: "Zona",
      type: "number",
      validation: { required: true },
    },
    {
      name: "registrationDate",
      label: "Fecha de Registro",
      type: "date",
      validation: { required: true },
    },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      options: [
        { label: "Individual", value: ClientType.INDIVIDUAL },
        { label: "Empresa", value: ClientType.COMPANY },
      ],
      validation: { required: true },
    },
  ];

  const displayFields: DisplayField<Client>[] = [
    { field: "name", label: "Nombre" },
    { field: "phone", label: "Teléfono" },
    { field: "address", label: "Dirección" },
    { field: "taxId", label: "CUIT/CUIL" },
    { field: "registrationDate", label: "Fecha de Registro" },
    { field: "type", label: "Tipo" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>

      <button
        onClick={handleNewClient}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Nuevo Cliente
      </button>

      {showForm && (
        <ItemForm<Client>
          initialValues={editingClient ?? emptyClient}
          onSubmit={handleSubmit}
          fields={fields}
        />
      )}

      <hr className="my-8" />

      <ItemList<Client>
        items={clients}
        itemType="cliente"
        onEdit={handleEdit}
        onDelete={handleDelete}
        displayFields={displayFields}
      />
    </div>
  );
};

export default ClientsPage;
