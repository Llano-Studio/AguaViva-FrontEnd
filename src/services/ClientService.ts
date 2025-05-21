import { Client, ClientsResponse, CreateClientDTO } from "../interfaces/Client";
import { apiFetch } from "../utils/apiFetch";

export class ClientService {
  private clientsUrl = "/persons";

  async getClients(): Promise<ClientsResponse> {
    try {
      return await apiFetch<ClientsResponse>(this.clientsUrl);
    } catch (error) {
      console.error("Error en getClients:", error);
      return {
        data: [],
        meta: {
          total: 0,
          page: 0,
          limit: 0,
          totalPage: 0,
        },
      };
    }
  }

  async getClientById(id: number): Promise<Client | null> {
    try {
      return await apiFetch<Client>(`${this.clientsUrl}/${id}`);
    } catch (error) {
      console.error("Error en getClientById:", error);
      return null;
    }
  }

  async createClient(client: CreateClientDTO): Promise<Client | null> {
    try {
      return await apiFetch<Client>(this.clientsUrl, {
        method: "POST",
        body: JSON.stringify(client),
      });
    } catch (error) {
      console.error("Error en createClient:", error);
      return null;
    }
  }

  async updateClient(id: number, client: Partial<CreateClientDTO>): Promise<Client | null> {
    try {
      return await apiFetch<Client>(`${this.clientsUrl}/${id}`, {
        method: "PUT",
        body: JSON.stringify(client),
      });
    } catch (error) {
      console.error("Error en updateClient:", error);
      return null;
    }
  }

  async deleteClient(id: number): Promise<boolean> {
    try {
      await apiFetch(`${this.clientsUrl}/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Error en deleteClient:", error);
      return false;
    }
  }
}
