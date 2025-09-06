export type ComodatoStatus = "ACTIVE" | "RETURNED" | "INACTIVE";

export interface ComodatoPersonMini {
  person_id: number;
  name: string;
  phone: string;
  address: string;
}

export interface ComodatoProductMini {
  product_id: number;
  name?: string;
  description?: string;
}

export interface Comodato {
  comodato_id: number;
  person_id: number;
  product_id: number;
  quantity: number;
  delivery_date: string;           // ISO
  expected_return_date: string;    // ISO
  actual_return_date?: string | null;
  status: ComodatoStatus;
  notes?: string;
  deposit_amount?: number;
  monthly_fee?: number;
  article_description?: string;
  brand?: string;
  model?: string;
  contract_image_path?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  person?: ComodatoPersonMini;
  product?: ComodatoProductMini;
}

export interface CreateComodatoDTO {
  person_id: number;
  product_id: number;
  quantity: number;
  delivery_date: string;          // YYYY-MM-DD
  expected_return_date: string;   // YYYY-MM-DD
  status: ComodatoStatus;
  notes?: string;
  deposit_amount?: number;
  monthly_fee?: number;
  article_description?: string;
  brand?: string;
  model?: string;
  contract_image_path?: string;
}

export type UpdateComodatoDTO = Partial<Omit<CreateComodatoDTO, "person_id">> & {
  actual_return_date?: string;    // YYYY-MM-DD
};