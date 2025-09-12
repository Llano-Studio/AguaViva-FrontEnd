import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { clientComodatoFields } from "../../config/clients/clientComodatoFieldsConfig";
import { ItemForm } from "../common/ItemForm";
import { Field } from "../../interfaces/Common";
import { useSnackbar } from "../../context/SnackbarContext";
import { CreateComodatoDTO } from "../../interfaces/Comodato";
import { ProductService } from "../../services/ProductService";

interface ClientComodatoFormProps {
  initialValues?: any;
  onSubmit: (values: any) => Promise<any> | any;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
}

type FormValues = Omit<CreateComodatoDTO, "person_id">;

const getInitialValues = (isEditing?: boolean, item?: any): FormValues => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const nextYearStr = nextYear.toISOString().slice(0, 10);

  if (isEditing && item) {
    return {
      product_id: Number(item.product_id ?? 0),
      quantity: Number(item.quantity ?? 1),
      delivery_date: item.delivery_date ? String(item.delivery_date).slice(0, 10) : todayStr,
      expected_return_date: item.expected_return_date ? String(item.expected_return_date).slice(0, 10) : "",
      status: item.status ?? "ACTIVE",
      notes: item.notes ?? "",
      deposit_amount: item.deposit_amount ?? 0,
      monthly_fee: item.monthly_fee ?? 0,
      article_description: item.product.description ?? "",
      brand: item.brand ?? "",
      model: item.model ?? "",
      contract_image_path: "",
    };
  }
  return {
    product_id: 0,
    quantity: 1,
    delivery_date: todayStr,
    expected_return_date: nextYearStr, // +1 año desde hoy
    status: "ACTIVE",
    notes: "",
    deposit_amount: 0,
    monthly_fee: 0,
    article_description: "",
    brand: "",
    model: "",
    contract_image_path: "",
  };
};

// Normaliza cuando ItemForm entrega FormData
function normalizeValues(values: FormValues | FormData): FormValues {
  if (values instanceof FormData) {
    const obj: Record<string, any> = {};
    values.forEach((val, key) => {
      obj[key] = val;
    });
    return {
      product_id: Number(obj.product_id ?? 0),
      quantity: Number(obj.quantity ?? 1),
      delivery_date: obj.delivery_date ? String(obj.delivery_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      expected_return_date: obj.expected_return_date ? String(obj.expected_return_date).slice(0, 10) : "",
      status: (obj.status as FormValues["status"]) ?? "ACTIVE",
      notes: obj.notes ? String(obj.notes) : "",
      deposit_amount: obj.deposit_amount != null && obj.deposit_amount !== "" ? Number(obj.deposit_amount) : 0,
      monthly_fee: obj.monthly_fee != null && obj.monthly_fee !== "" ? Number(obj.monthly_fee) : 0,
      article_description: obj.article_description ? String(obj.article_description) : "",
      brand: obj.brand ? String(obj.brand) : "",
      model: obj.model ? String(obj.model) : "",
      contract_image_path: obj.contract_image_path ? String(obj.contract_image_path) : "",
    };
  }
  return values;
}

const ClientComodatoForm: React.FC<ClientComodatoFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading,
  error,
  isEditing,
}) => {
  const { showSnackbar } = useSnackbar();
  const productService = useMemo(() => new ProductService(), []);

  const computedInitials = useMemo(
    () => getInitialValues(isEditing, initialValues),
    [isEditing, initialValues]
  );

  const form = useForm<FormValues>({ defaultValues: computedInitials });

  // Registramos product_id para poder leerlo del estado de RHF aunque el ItemForm no tenga un input visible
  useEffect(() => {
    form.register("product_id", { valueAsNumber: true });
    form.setValue("product_id", computedInitials.product_id, { shouldDirty: false });
  }, [form, computedInitials.product_id]);

  // Estado local del buscador para evitar loops con el form
  const [searchText, setSearchText] = useState<string>(computedInitials.article_description || "");
  useEffect(() => {
    setSearchText(computedInitials.article_description || "");
    form.reset(computedInitials);
  }, [computedInitials, form]);

  // Cache y control de llamadas en vuelo para evitar loops
  const cacheRef = useRef<Map<string, any[]>>(new Map());
  const inFlightRef = useRef<string | null>(null);

  // Llamada directa al servicio. Solo la usa el SearchBar (abrir/tipear).
  const fetchProductOptions = useCallback(
    async (query: string) => {
      const q = (query || "").trim();

      // cache
      const cached = cacheRef.current.get(q);
      if (cached) return cached;

      // evitar duplicadas por misma query
      if (inFlightRef.current === q) return cached || [];

      inFlightRef.current = q;
      try {
        const res = await productService.getProducts({
          page: 1,
          limit: 10,
          search: q,
          isReturnable: true,
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        cacheRef.current.set(q, list);
        return list;
      } catch {
        return [];
      } finally {
        if (inFlightRef.current === q) inFlightRef.current = null;
      }
    },
    [productService]
  );

  const fields: Field<any>[] = clientComodatoFields;

  const searchFieldProps = {
    article_description: {
      value: searchText,
      onChange: (val: string) => setSearchText(val),
      fetchOptions: fetchProductOptions,
      optionLabelKey: "description",
      optionValueKey: "product_id",
      renderOption: (p: any) => <span>{p.description}</span>,
      onOptionSelect: (p: any) => {
        // Setear en RHF para que podamos tomarlo en el submit aunque no exista input visible
        form.setValue("product_id", Number(p.product_id), { shouldDirty: true, shouldValidate: true });
        form.setValue("article_description", p.description || "", { shouldDirty: true });
        setSearchText(p.description || "");
        const q = (p.description || "").trim();
        if (q && !cacheRef.current.has(q)) cacheRef.current.set(q, [p]);
      },
      placeholder: "Buscar artículo...",
      class: "client-comodato",
      minChars: 0,
    },
  } as const;

  const handleSubmit: (values: FormValues | FormData) => void = (values) => {
    // Normalizar
    const payload = normalizeValues(values);
    // Forzar product_id desde el estado de RHF por si el FormData no lo incluye
    const selectedId = form.getValues("product_id");
    if (selectedId != null) {
      payload.product_id = Number(selectedId);
    }
    void Promise.resolve(onSubmit(payload))
      .then(() => {
        showSnackbar(
          isEditing ? "Comodato actualizado correctamente." : "Comodato creado correctamente.",
          "success"
        );
      })
      .catch((e: any) => {
        showSnackbar(e?.message || "Error al guardar el comodato", "error");
      });
  };

  useEffect(() => {
    if (error) showSnackbar(error, "error");
  }, [error, showSnackbar]);

  return (
    <>
      <ItemForm
        {...form}
        fields={fields}
        searchFieldProps={searchFieldProps}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        class="client-comodato"
      />
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Cargando...</div>}
    </>
  );
};

export default ClientComodatoForm;