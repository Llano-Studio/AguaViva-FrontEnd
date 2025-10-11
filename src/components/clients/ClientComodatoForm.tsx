import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { ItemForm } from "../common/ItemForm";
import { Field } from "../../interfaces/Common";
import { useSnackbar } from "../../context/SnackbarContext";
import { ProductService } from "../../services/ProductService";
import { clientComodatoFields } from "../../config/clients/clientComodatoFieldsConfig";
import SpinnerLoading from "../common/SpinnerLoading";

interface ClientComodatoFormProps {
  initialValues?: any;
  onSubmit: (fd: FormData) => Promise<any> | any; // siempre FormData
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
  personId?: number; // lo agrega el contenedor al FormData (no desde acá)
}

const getInitialValues = (isEditing?: boolean, item?: any): any => {
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

  // Usamos RHF; ItemForm construirá el FormData
  const form = useForm<any>({ defaultValues: computedInitials });

  // product_id (por SearchBar)
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

  // Completar el FormData de ItemForm con product_id y contract_image si faltan
  const handleSubmit = (values: any) => {
    const fd = values instanceof FormData ? values : new FormData();
    fd.delete("contract_image_path");

    const v = form.getValues();
    const normDate = (d: any) => (d ? String(d).slice(0, 10) : "");

    // Asegurar product_id
    const pidFromFD = fd.get("product_id");
    const pid = pidFromFD ?? v.product_id;
    if (pid != null && String(pid).trim() !== "") {
      fd.set("product_id", String(pid));
    }

    // Rellenar campos obligatorios si faltan en el FD (por seguridad)
    if (!fd.has("quantity") && v.quantity != null) fd.set("quantity", String(v.quantity));
    if (!fd.has("delivery_date")) fd.set("delivery_date", normDate(v.delivery_date));
    if (!fd.has("expected_return_date")) fd.set("expected_return_date", normDate(v.expected_return_date));
    if (!fd.has("status") && v.status != null) fd.set("status", String(v.status));

    // Opcionales si faltan
    if (!fd.has("notes") && v.notes != null) fd.set("notes", String(v.notes));
    if (!fd.has("deposit_amount") && v.deposit_amount != null) fd.set("deposit_amount", String(v.deposit_amount));
    if (!fd.has("monthly_fee") && v.monthly_fee != null) fd.set("monthly_fee", String(v.monthly_fee));
    if (!fd.has("article_description") && v.article_description != null)
      fd.set("article_description", String(v.article_description));
    if (!fd.has("brand") && v.brand != null) fd.set("brand", String(v.brand));
    if (!fd.has("model") && v.model != null) fd.set("model", String(v.model));

    // Asegurar contract_image si el usuario seleccionó archivo o string
    if (!fd.has("contract_image") && v.contract_image) {
      if (v.contract_image instanceof Blob) {
        fd.set("contract_image", v.contract_image);
      } else if (typeof v.contract_image === "string" && v.contract_image.trim() !== "") {
        fd.set("contract_image", v.contract_image.trim());
      }
    }

    return onSubmit(fd);
  };

  useEffect(() => {
    if (error) showSnackbar(error, "error");
  }, [error, showSnackbar]);

  return (
    <>
      <ItemForm<any>
        {...form}
        fields={fields}
        searchFieldProps={searchFieldProps}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        class="client-comodato"
      />
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="p-4 container-loading"><SpinnerLoading/></div>}
    </>
  );
};

export default ClientComodatoForm;