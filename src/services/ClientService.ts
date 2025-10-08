import { Client, CreateClientDTO, ClientsResponse, LoanedProduct, ChangeSubscriptionPlanDTO, CancelSubscriptionDTO } from "../interfaces/Client";
import { httpAdapter } from "./httpAdapter";
import { Comodato, CreateComodatoDTO, UpdateComodatoDTO, } from "../interfaces/Comodato";

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

  async getLoanedProducts(clientId: number): Promise<LoanedProduct[]> {
    try {
      return await httpAdapter.get<LoanedProduct[]>(`${this.clientsUrl}/${clientId}/loaned-products-detail`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener productos en comodato");
    }
  }

  async cancelSubscription(personId: number, subscriptionId: number, payload: CancelSubscriptionDTO): Promise<Client> {
    try {
      const url = `${this.clientsUrl}/${personId}/subscriptions/${subscriptionId}/cancel`;
      return await httpAdapter.patch<Client>(payload, url);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al cancelar la suscripción");
    }
  }

  async changeSubscriptionPlan(personId: number, dto: ChangeSubscriptionPlanDTO): Promise<Client> {
    try {
      const url = `${this.clientsUrl}/${personId}/subscriptions/change-plan`;
      return await httpAdapter.post<Client>(dto, url);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al cambiar el plan de suscripción");
    }
  }

  // Crear comodato – pasar isFormData si dto es FormData
  async createComodato(personId: number, dto: FormData | CreateComodatoDTO): Promise<Comodato> {
    try {
      const url = `${this.clientsUrl}/${personId}/comodatos`;
      const isFormData = typeof FormData !== "undefined" && dto instanceof FormData;
      return await httpAdapter.post<Comodato>(dto, url, isFormData ? { isFormData: true } : undefined);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear comodato");
    }
  }

  async getPersonComodatos(personId: number): Promise<Comodato[]> {
    try {
      const url = `${this.clientsUrl}/${personId}/comodatos`;
      return await httpAdapter.get<Comodato[]>(url);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener comodatos del cliente");
    }
  }

  async getAllComodatos(): Promise<Comodato[]> {
    try {
      const url = `${this.clientsUrl}/comodatos`;
      return await httpAdapter.get<Comodato[]>(url);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener todos los comodatos");
    }
  }

  async getComodatoById(personId: number, comodatoId: number): Promise<Comodato> {
    try {
      const url = `${this.clientsUrl}/${personId}/comodatos/${comodatoId}`;
      return await httpAdapter.get<Comodato>(url);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener el comodato");
    }
  }

  async updateComodato(personId: number, comodatoId: number, dto: FormData | UpdateComodatoDTO): Promise<Comodato> {
    try {
      const url = `${this.clientsUrl}/${personId}/comodatos/${comodatoId}`;
      const isFormData = typeof FormData !== "undefined" && dto instanceof FormData;
      return await httpAdapter.patch<Comodato>(dto, url, isFormData ? { isFormData: true } : undefined);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar el comodato");
    }
  }

  async deleteComodato(personId: number, comodatoId: number): Promise<{ deleted: boolean; message?: string }> {
    try {
      const url = `${this.clientsUrl}/${personId}/comodatos/${comodatoId}`;
      return await httpAdapter.delete<{ deleted: boolean; message?: string }>(url);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar el comodato");
    }
  }
}