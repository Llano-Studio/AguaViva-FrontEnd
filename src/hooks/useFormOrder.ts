import { useState } from "react";
import { ClientService } from "../services/ClientService";
import { ZoneService } from "../services/ZoneService";
import { ProductService } from "../services/ProductService";
import { ClientSubscriptionService } from "../services/ClientSubscriptionService";
import { SubscriptionPlanService } from "../services/SubscriptionPlanService";
import { PriceListService } from "../services/PriceListService";

const clientService = new ClientService();
const zoneService = new ZoneService();
const productService = new ProductService();
const subscriptionService = new ClientSubscriptionService();
const subscriptionPlanService = new SubscriptionPlanService();
const priceListService = new PriceListService();

export function useFormOrder() {
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [zoneMobiles, setZoneMobiles] = useState<any[]>([]);
  const [loadingClient, setLoadingClient] = useState(false);

  // Buscar clientes usando el servicio real
  const fetchClients = async (params: any = {}, clientType: "PLAN" | "INDIVIDUAL" = "PLAN") => {
    console.log("Fetching clients with params:", params, "and clientType:", clientType);
    const response = await clientService.getClients({ ...params, type: clientType });
    return response?.data || [];
  };

  // Buscar productos
  const fetchProducts = async (query: string) => {
    const response = await productService.getProducts({ search: query });
    return response?.data || [];
  };

  // Buscar producto por ID
  const fetchProductById = async (productId: number) => {
    if (!productId) return null;
    return await productService.getProductById(productId);
  };

  // Traer detalles del cliente seleccionado (con tipo)
  const fetchClientDetails = async (clientId: number) => {
    if (!clientId) return null;
    setLoadingClient(true);
    try {
      const details = await clientService.getClientById(clientId);
      setClientDetails(details);
      return details;
    } finally {
      setLoadingClient(false);
    }
  };

  // Traer móviles de la zona
  const fetchZoneMobiles = async (zoneId: number) => {
    if (!zoneId) {
      setZoneMobiles([]);
      return [];
    }
    const mobiles = await zoneService.getZoneVehicles(zoneId);
    setZoneMobiles(mobiles);
    return mobiles;
  };

  const fetchSubscriptionsByCustomer = async (customerId: number, query?: string) => {
    if (!customerId) return [];
    const response = await subscriptionService.getSubscriptionsByCustomer(customerId, {});
    return response?.data || [];
  };

  const fetchProductsBySubscriptionPlan = async (planId: number) => {
    if (!planId) return [];
    const response = await subscriptionPlanService.getSubscriptionPlanById(planId);
    return response?.products || [];
  };

  const fetchPriceLists = async (query?: string) => {
    const params = query ? { search: query } : {};
    const response = await priceListService.getPriceLists(params);
    return response?.data || [];
  };

  // Permite limpiar el estado si es necesario
  const clearClientAndMobiles = () => {
    setClientDetails(null);
    setZoneMobiles([]);
  };

  return {
    fetchClients,
    fetchProducts,
    fetchProductById,
    fetchClientDetails,
    fetchZoneMobiles,
    fetchSubscriptionsByCustomer,
    fetchProductsBySubscriptionPlan,
    fetchPriceLists,
    clientDetails,
    zoneMobiles,
    loadingClient,
    clearClientAndMobiles,
  };
}