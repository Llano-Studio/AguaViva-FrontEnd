import { Client, CreateClientDTO, ClientsResponse } from "../interfaces/Client";
import { httpAdapter } from "./httpAdapter";

export class ClientService {
  private clientsUrl = "/persons";

  async getClients(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<ClientsResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<ClientsResponse>(this.clientsUrl, { params: safeParams });
  }

  async getClientById(id: number): Promise<Client | null> {
    try {
      return await httpAdapter.get<Client>(`${this.clientsUrl}/${id}`);
    } catch (error) {
      console.error("Error en getClientById:", error);
      return null;
    }
  }

  async createClient(client: CreateClientDTO): Promise<any> {
    try {
      return await httpAdapter.post<any>(client, this.clientsUrl);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear cliente");
    }
  }

  async updateClient(id: number, client: Partial<CreateClientDTO>): Promise<Client | null> {
    try {
      return await httpAdapter.patch<Client>(client, `${this.clientsUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar cliente");
    }
  }

  async deleteClient(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.clientsUrl}/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar cliente");
    }
  }
}