import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { ItemForm } from "../common/ItemForm";
import { Field } from "../../interfaces/Common";
import { useSnackbar } from "../../context/SnackbarContext";
import { CreateComodatoDTO } from "../../interfaces/Comodato";
import { ProductService } from "../../services/ProductService";
import { clientComodatoFields } from "../../config/clients/clientComodatoFieldsConfig";

interface ClientComodatoFormProps {
  initialValues?: any;
  onSubmit: (values: FormData | Record<string, any>) => Promise<any> | any;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
}

type FormValues = Omit<CreateComodatoDTO, "person_id"> & {
  article_description?: string;
  brand?: string;
  model?: string;
  // si tu campo de archivo llega como File
  contract_image?: File | null;
  // si llega como string path
  contract_image_path?: string;
};

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
      article_description: item.product?.description ?? "",
      brand: item.brand ?? "",
      model: item.model ?? "",
      contract_image: null,
      contract_image_path: "",
    };
  }
  return {
    product_id: 0,
    quantity: 1,
    delivery_date: todayStr,
    expected_return_date: nextYearStr,
    status: "ACTIVE",
    notes: "",
    deposit_amount: 0,
    monthly_fee: 0,
    article_description: "",
    brand: "",
    model: "",
    contract_image: null,
    contract_image_path: "",
  };
};

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

  // Registramos product_id para poder leerlo del estado aunque ItemForm no tenga input visible
  useEffect(() => {
    form.register("product_id", { valueAsNumber: true });
    form.setValue("product_id", computedInitials.product_id, { shouldDirty: false });
  }, [form, computedInitials.product_id]);

  // Estado local del buscador
  const [searchText, setSearchText] = useState<string>(computedInitials.article_description || "");
  useEffect(() => {
    setSearchText(computedInitials.article_description || "");
    form.reset(computedInitials);
  }, [computedInitials, form]);

  // Cache de búsquedas
  const cacheRef = useRef<Map<string, any[]>>(new Map());
  const inFlightRef = useRef<string | null>(null);

  const fetchProductOptions = useCallback(
    async (query: string) => {
      const q = (query || "").trim();
      const cached = cacheRef.current.get(q);
      if (cached) return cached;
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

  // Construcción de FormData igual que en ProductForm
  const handleSubmit = async (values: FormValues | FormData) => {
    try {
      const v = form.getValues(); // valores completos del formulario

      const fd = new FormData();
      fd.set("product_id", String(v.product_id ?? 0));
      fd.set("quantity", String(v.quantity ?? 1));
      fd.set("delivery_date", v.delivery_date ? String(v.delivery_date).slice(0, 10) : "");
      fd.set("expected_return_date", v.expected_return_date ? String(v.expected_return_date).slice(0, 10) : "");
      fd.set("status", v.status ?? "ACTIVE");
      fd.set("notes", v.notes ? String(v.notes) : "");
      fd.set("deposit_amount", String(v.deposit_amount ?? 0));
      fd.set("monthly_fee", String(v.monthly_fee ?? 0));
      fd.set("article_description", v.article_description ? String(v.article_description) : "");
      fd.set("brand", v.brand ? String(v.brand) : "");
      fd.set("model", v.model ? String(v.model) : "");
      // Si usás path además de archivo
      if (v.contract_image_path) fd.set("contract_image_path", String(v.contract_image_path));

      // Fusionar archivos provenientes del ItemForm (si envió FormData)
      if (values instanceof FormData) {
        values.forEach((val, key) => {
          if (val instanceof Blob) {
            fd.set(key, val); // priorizar archivos reales
          } else if (!fd.has(key)) {
            fd.set(key, String(val));
          }
        });
      }

      const ok = await onSubmit(fd);

      if (ok !== false) {
        showSnackbar(isEditing ? "Comodato actualizado correctamente." : "Comodato creado correctamente.", "success");
        onCancel();
      } else {
        showSnackbar("Error al guardar el comodato", "error");
      }
    } catch (e: any) {
      showSnackbar(e?.message || "Error al guardar el comodato", "error");
      console.error(e);
    }
  };

  useEffect(() => {
    if (error) showSnackbar(error, "error");
  }, [error, showSnackbar]);

  return (
    <>
      <ItemForm<FormValues>
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