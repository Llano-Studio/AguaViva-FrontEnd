import { PriceListService } from "../services/PriceListService";

const priceListService = new PriceListService();

export const calculatePriceUnitAndTotalOfItem = async (
  product_id: number,
  price_list_id: number,
  quantity: number
): Promise<{ price_unit: string; price_total_item: string }> => {
  // Obtener la lista de precios por ID
  const priceList = await priceListService.getPriceListById(price_list_id);
  if (!priceList || !Array.isArray(priceList.price_list_item)) {
    return { price_unit: "0", price_total_item: "0" };
  }

  // Buscar el item correspondiente al producto
  const item = priceList.price_list_item.find(
    (pli: any) => pli.product_id === product_id
  );

  if (!item || !item.unit_price) {
    return { price_unit: "0", price_total_item: "0" };
  }

  // Calcular el total
  const price_unit = item.unit_price;
  const price_total_item = (parseFloat(price_unit) * quantity).toString();

  return { price_unit, price_total_item };
};