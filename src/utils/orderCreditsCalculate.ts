// Utilidades para manejo de créditos de abonos en pedidos

export interface AbonoCredit {
  product_id: number;
  product_description: string;
  remaining_balance: number;
  [key: string]: any;
}

export interface OrderArticleLike {
  product_id: number;
  quantity: number;
  price_list_id?: number;
  [key: string]: any;
}

export const calculateQuantityCredits = (
  availableCredits: AbonoCredit[],
  productId: number,
  quantity: number
): { abonoQty: number; extraQty: number } => {
  const credit = availableCredits.find(c => c.product_id === productId);
  const remaining = credit?.remaining_balance ?? 0;
  if (quantity <= remaining) {
    return { abonoQty: quantity, extraQty: 0 };
  }
  return { abonoQty: remaining, extraQty: quantity - remaining };
};

export const applyCreditDelta = (
  availableCredits: AbonoCredit[],
  productId: number,
  delta: number
): AbonoCredit[] => {
  return availableCredits.map(c =>
    c.product_id === productId
      ? {
          ...c,
          remaining_balance: Math.max(0, c.remaining_balance + delta),
        }
      : c
  );
};

/**
 * Genera la leyenda HTML de créditos disponibles.
 * IMPORTANTE:
 * - Ahora NO recalcula restando artículos porque el estado availableCredits
 *   ya refleja los consumos (se actualiza con applyCreditDelta al agregar/quitar).
 * - Esto evita la doble resta (bug: agregabas 2 y mostraba -4).
 *
 * Si en algún otro contexto necesitas recalcular desde artículos (modelo viejo),
 * puedes usar la opción { recomputeFromArticles: true }.
 */
export const generateCreditsLegendHTML = (
  abonoSelected: any,
  availableCredits: AbonoCredit[],
  articles: OrderArticleLike[] = [],
  options: { recomputeFromArticles?: boolean } = {}
): string | null => {
  if (!abonoSelected || availableCredits.length === 0) return null;

  let creditsForLegend: AbonoCredit[];

  if (options.recomputeFromArticles) {
    // Solo si explícitamente se pide recalcular (compatibilidad legacy)
    const creditsCopy = availableCredits.map(c => ({ ...c }));
    articles.forEach(item => {
      if (!item.price_list_id) {
        const credit = creditsCopy.find(c => c.product_id === item.product_id);
        if (credit) {
          credit.remaining_balance -= Number(item.quantity);
          if (credit.remaining_balance < 0) credit.remaining_balance = 0;
        }
      }
    });
    creditsForLegend = creditsCopy;
  } else {
    // Uso normal (estado ya actualizado)
    creditsForLegend = availableCredits;
  }

  const legendParts = creditsForLegend
    .filter(c => c.remaining_balance > 0)
    .map(c => `<b>${c.remaining_balance}</b> ${c.product_description}`);

  if (legendParts.length === 0) return "No hay créditos disponibles para el abono seleccionado";

  let legendText = "";
  if (legendParts.length === 1) legendText = legendParts[0];
  else if (legendParts.length === 2) legendText = `${legendParts[0]} y ${legendParts[1]}`;
  else legendText = `${legendParts.slice(0, -1).join(", ")} y ${legendParts[legendParts.length - 1]}`;

  return `El cliente tiene disponible ${legendText} para el abono seleccionado`;
};