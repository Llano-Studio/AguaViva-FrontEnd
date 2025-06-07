import { Client, CreateClientDTO, ClientsResponse } from "../interfaces/Client";
import { httpAdapter } from "./httpAdapter";

export class ClientService {
  private clientsUrl = "/persons";

  async getClients(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<ClientsResponse> {
    return await httpAdapter.get<ClientsResponse>(this.clientsUrl, { params });
  }

  async getClientById(id: number): Promise<Client | null> {
    try {
      return await httpAdapter.get<Client>(`${this.clientsUrl}/${id}`);
    } catch (error) {
      console.error("Error en getClientById:", error);
      return null;
    }
  }

  async createClient(client: CreateClientDTO): Promise<Client | null> {
    try {
      return await httpAdapter.post<Client>(client, this.clientsUrl);
    } catch (error) {
      console.error("Error en createClient:", error);
      return null;
    }
  }

  async updateClient(id: number, client: Partial<CreateClientDTO>): Promise<Client | null> {
    try {
      return await httpAdapter.patch<Client>(client, `${this.clientsUrl}/${id}`);
    } catch (error) {
      console.error("Error en updateClient:", error);
      return null;
    }
  }

  async deleteClient(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.clientsUrl}/${id}`);
      return true;
    } catch (error) {
      console.error("Error en deleteClient:", error);
      return false;
    }
  }
}