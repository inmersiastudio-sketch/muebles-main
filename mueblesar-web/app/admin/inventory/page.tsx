"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useAdmin } from "../layout";
import { FileUpload } from "../../components/ui/FileUpload";
import { AI3DGenerator } from "../../components/admin/AI3DGenerator";
import { ARPreview } from "../../components/products/ARPreview";
import { ProductLogModal } from "../../components/admin/inventory/ProductLogModal";
import { VariantManager, type ProductVariantForm } from "../../components/admin/VariantManager";

import type { AdminProductListItem, ValidationResult, Store, ProductLogEntry } from "@/types";
import {
  FormState,
  emptyForm,
  isValidUrl,
  slugify,
} from "../../lib/admin.types";

import { useToast } from "../../context/ToastContext";
import {
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Trash2,
  Pencil,
  History,
  Download,
  Upload,
  Loader2,
  Package,
  Box,
  BarChart3,
  Check,
  AlertTriangle,
  Image as ImageIcon,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  XCircle,
  Loader,
  Sparkles,
} from "lucide-react";

// ─── Tabs ───
type ViewTab = "general" | "ar" | "stock";
const tabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Package },
  { id: "ar", label: "AR / 3D", icon: Box },
  { id: "stock", label: "Stock", icon: BarChart3 },
];

const headerTranslations: Record<string, string> = {
  id: "ID",
  storeId: "ID Tienda",
  name: "Nombre",
  slug: "Enlace (Slug)",
  price: "Precio",
  category: "Categoría",
  room: "Ambiente",
  style: "Estilo",
  arUrl: "Modelo AR (.usdz)",
  glbUrl: "Modelo 3D (.glb)",
  usdzUrl: "Modelo USDZ",
  imageUrl: "Imagen (URL)",
  inStock: "Disponible",
  stockQty: "Stock (Cant.)",
  widthCm: "Ancho (cm)",
  depthCm: "Prof. (cm)",
  heightCm: "Alto (cm)",
  weightKg: "Peso (kg)",
  featured: "Destacado",
  isFeatured: "Destacado",
};

const formatPreviewValue = (header: string, val: string) => {
  if (val === undefined || val === null || val.trim() === "") return "-";
  
  if (header === "inStock" || header === "featured" || header === "isFeatured") {
    const isTrue = val.toLowerCase() === "true" || val === "1";
    return isTrue ? "Sí" : "No";
  }
  
  if (header === "price") {
    const num = Number(val);
    if (!isNaN(num)) {
      return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(num);
    }
  }
  
  return val;
};

export default function InventoryPage() {
  const { user, apiBase } = useAdmin();
  const { success: showSuccess, error: showError } = useToast();

  // Data
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<Record<number, ValidationResult | { error: string }>>({});
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterInStock, setFilterInStock] = useState<"" | "yes" | "no">("");
  const [sortField, setSortField] = useState<"" | "name" | "price" | "id">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<ViewTab>("general");
  const pageSize = 20;

  // Selection + bulk
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [variants, setVariants] = useState<ProductVariantForm[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formValidation, setFormValidation] = useState<ValidationResult | { error: string } | null>(null);
  const [formValidating, setFormValidating] = useState(false);

  // Image preview
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Product log modal
  const [logProductId, setLogProductId] = useState<number | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Async action states
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [copyingId, setCopyingId] = useState<number | null>(null);

  // CSV
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [pendingImportRows, setPendingImportRows] = useState<string[][]>([]);
  const [importStoreId, setImportStoreId] = useState<string>("");
  const [selectedImportIndices, setSelectedImportIndices] = useState<Set<number>>(new Set());
  const [originalProduct, setOriginalProduct] = useState<AdminProductListItem | null>(null);

  const [aiGeneratorProduct, setAiGeneratorProduct] = useState<AdminProductListItem | null>(null);

  // ─── Derived data ───
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter((v): v is string => Boolean(v)))).sort();
  }, [products]);

  const currentStore = useMemo(() => {
    if (!user) return null;
    const storeId = user.role === "SUPER_ADMIN" ? Number(importStoreId) : user.storeId;
    if (!storeId) return null;
    return stores.find(s => s.id === storeId);
  }, [user, importStoreId, stores]);

  const capacityInfo = useMemo(() => {
    if (!currentStore) return null;
    const max = currentStore.maxProducts ?? 10;
    const current = currentStore._count?.products ?? 0;
    const remaining = Math.max(0, max - current);
    return { max, current, remaining };
  }, [currentStore]);

  const toggleSelectImportRow = (index: number) => {
    setSelectedImportIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleSelectAllImport = () => {
    if (selectedImportIndices.size === pendingImportRows.length) {
      setSelectedImportIndices(new Set());
    } else {
      setSelectedImportIndices(new Set(pendingImportRows.map((_, idx) => idx)));
    }
  };

  const filteredProducts = useMemo(() => {
    let arr = products;
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          String(p.id).includes(t) ||
          p.slug?.toLowerCase().includes(t) ||
          p.category?.toLowerCase().includes(t) ||
          p.store?.name?.toLowerCase().includes(t)
      );
    }
    if (filterCategory) arr = arr.filter((p) => p.category === filterCategory);
    if (filterInStock) arr = arr.filter((p) => (filterInStock === "yes" ? p.inStock : !p.inStock));
    return arr;
  }, [products, searchTerm, filterCategory, filterInStock]);

  const sortedProducts = useMemo(() => {
    if (!sortField) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      let va: any = a[sortField as keyof AdminProductListItem];
      let vb: any = b[sortField as keyof AdminProductListItem];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortField, sortDir]);

  const pagedProducts = useMemo(() => sortedProducts.slice((page - 1) * pageSize, page * pageSize), [sortedProducts, page]);
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));

  const gridClassName = useMemo(() => {
    const isSuper = user?.role === "SUPER_ADMIN";
    if (activeTab === "general") {
      return isSuper 
        ? "grid-cols-[44px_1fr_110px_130px_130px_180px]" 
        : "grid-cols-[44px_1fr_120px_150px_180px]";
    }
    if (activeTab === "ar") {
      return "grid-cols-[44px_1fr_110px_140px_80px_180px]";
    }
    // stock
    return "grid-cols-[44px_1fr_110px_140px_110px_180px]";
  }, [activeTab, user]);

  useEffect(() => { setPage(1); }, [searchTerm, filterCategory, filterInStock, sortField, sortDir]);

  // ─── API calls ───
  const loadProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/admin/products`, { credentials: "include" });
      const data = await res.json().catch(() => ({ items: [] }));
      if (!res.ok) { setError((data as any)?.error || `Error ${res.status}`); return; }
      setProducts(data?.items || []);
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  }, [user, apiBase]);

  useEffect(() => {
    if (user) {
      loadProducts();
      fetch(`${apiBase}/api/stores`).then((r) => r.json()).then((d) => setStores(d?.items ?? [])).catch(() => { });
      fetch(`${apiBase}/api/admin/settings`, { credentials: "include" }).then((r) => r.json()).then((d) => setSettings(d)).catch(() => { });
    }
  }, [user, apiBase, loadProducts]);

  const updateProductField = async (id: number, patch: Partial<AdminProductListItem>) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/products/${id}`, {
        method: "PUT", headers: { "content-type": "application/json" }, credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as any).error || `Error ${res.status}`); }
      await loadProducts();
    } catch (err) { setError((err as Error).message); }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("¿Borrar producto?")) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await fetch(`${apiBase}/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
      await loadProducts();
      showSuccess("Producto eliminado correctamente");
    } catch (err) {
      showError("Error al eliminar producto");
    } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const copyARLink = async (product: AdminProductListItem) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const arUrl = `${siteUrl}/ar/${product.id}`;
    setCopyingId(product.id);
    try {
      await navigator.clipboard.writeText(arUrl);
      showSuccess("Link AR copiado al portapapeles");
    } catch {
      showError("Error al copiar link");
    } finally {
      setCopyingId(null);
    }
  };

  const validate = async (product: AdminProductListItem) => {
    if (!product.arUrl) { setValidation((p) => ({ ...p, [product.id]: { error: "Sin arUrl" } })); return; }
    setValidation((p) => ({ ...p, [product.id]: { error: "Validando..." } }));
    try {
      const tol = Number(settings.tolerance ?? "0.05") || 0.05;
      const res = await fetch(`${apiBase}/api/ar/validate-scale?tolerance=${tol}`, {
        method: "POST", headers: { "content-type": "application/json" }, credentials: "include",
        body: JSON.stringify({ file: product.arUrl, widthCm: product.widthCm, depthCm: product.depthCm, heightCm: product.heightCm }),
      });
      const data = await res.json();
      setValidation((p) => ({ ...p, [product.id]: res.ok ? data : { error: data?.error || `Error ${res.status}` } }));
    } catch (err) { setValidation((p) => ({ ...p, [product.id]: { error: (err as Error).message } })); }
  };

  // ─── Drawer CRUD ───
  const openCreate = () => {
    setForm({ ...emptyForm, storeId: user?.storeId ?? undefined });
    setVariants([]); // Empezar sin variantes, el usuario las agrega
    setFormErrors({});
    setFormValidation(null);
    setDrawerOpen(true);
  };

  const openEdit = (p: AdminProductListItem) => {
    setOriginalProduct(p);
    const dims = (p as any).dimensions || {};
    const pkgDims = dims.packageDimensions || {};
    const logs = (p as any).logistics || {};
    const delDays = logs.deliveryTimeDays || {};
    const ass = logs.assembly || {};
    const pkg = logs.packaging || {};

    setForm({
      id: p.id, storeId: p.storeId, name: p.name, slug: p.slug,
      description: p.description ?? "", category: p.category ?? "", room: p.room ?? "",
      style: p.style ?? "", color: p.color ?? "", featured: Boolean(p.featured),
      price: String(p.price ?? ""), arUrl: p.arUrl ?? "", glbUrl: p.glbUrl ?? "", usdzUrl: p.usdzUrl ?? "",
      widthCm: dims.widthCm ? String(dims.widthCm) : (p.widthCm ? String(p.widthCm) : ""),
      depthCm: dims.depthCm ? String(dims.depthCm) : (p.depthCm ? String(p.depthCm) : ""),
      heightCm: dims.heightCm ? String(dims.heightCm) : (p.heightCm ? String(p.heightCm) : ""),
      imageUrl: p.imageUrl ?? "",
      images: p.images?.map((i) => ({ url: i.url, type: i.type || undefined })) ?? [],
      inStock: Boolean(p.inStock), stockQty: p.stockQty ? String(p.stockQty) : "",
      
      // Nuevos campos de logística y empaque
      weightKg: dims.weightKg ? String(dims.weightKg) : "",
      packageWidthCm: pkgDims.widthCm ? String(pkgDims.widthCm) : "",
      packageHeightCm: pkgDims.heightCm ? String(pkgDims.heightCm) : "",
      packageDepthCm: pkgDims.depthCm ? String(pkgDims.depthCm) : "",
      packageWeightKg: pkgDims.weightKg ? String(pkgDims.weightKg) : "",
      deliveryMinDays: delDays.min ? String(delDays.min) : "2",
      deliveryMaxDays: delDays.max ? String(delDays.max) : "7",
      deliveryType: logs.deliveryType || "home",
      assemblyIncluded: Boolean(ass.included),
      assemblyPrice: ass.price ? String(ass.price) : "",
      assemblyTimeMinutes: ass.estimatedTimeMinutes ? String(ass.estimatedTimeMinutes) : "",
      assemblyDifficulty: ass.difficulty || "easy",
      piecesCount: pkg.piecesCount ? String(pkg.piecesCount) : "1",
      specialHandling: Boolean(pkg.specialHandling),
    });
    // Cargar variantes del producto
    if (p.variants && p.variants.length > 0) {
      setVariants(p.variants.map((v) => ({
        id: v.id,
        sku: p.sku || "",
        name: v.name,
        salePrice: v.salePrice,
        listPrice: v.salePrice, // Asumimos mismo precio si no hay listPrice
        currency: "ARS",
        stock: v.stock,
        isDefault: v.isDefault,
        images: [], // Las imágenes de variante vendrían de otra relación
      })));
    } else {
      // Crear una variante default con los datos del producto plano (legacy)
      setVariants([{
        sku: p.sku || "",
        name: p.name,
        color: p.color || undefined,
        listPrice: p.price || 0,
        salePrice: p.price || 0,
        currency: "ARS",
        stock: p.stockQty || 0,
        isDefault: true,
        images: p.images?.map((i) => ({ url: i.url, alt: p.name })) || [],
      }]);
    }
    setFormErrors({});
    setFormValidation(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setForm(emptyForm); setVariants([]); setFormErrors({}); setFormValidation(null); setOriginalProduct(null); };

  const submitForm = async () => {
    const errors: Record<string, string> = {};
    if (!form.storeId) errors.storeId = "Requerido";
    if (!form.name.trim()) errors.name = "Requerido";
    if (!form.slug.trim()) errors.slug = "Requerido";
    if (!form.description.trim()) errors.description = "Requerido";
    const priceVal = Number(form.price);
    if (!form.price || isNaN(priceVal) || priceVal <= 0) errors.price = "Precio inválido";
    if (form.arUrl && !isValidUrl(form.arUrl)) errors.arUrl = "URL inválida";
    if (form.glbUrl && !isValidUrl(form.glbUrl)) errors.glbUrl = "URL inválida";
    if (form.usdzUrl && !isValidUrl(form.usdzUrl)) errors.usdzUrl = "URL inválida";
    if (form.imageUrl && !isValidUrl(form.imageUrl)) errors.imageUrl = "URL inválida";
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSaving(true);
    setError(null);
    try {
      const w = Number(form.widthCm);
      const h = Number(form.heightCm);
      const d = Number(form.depthCm);
      const wt = Number(form.weightKg);

      const originalDimensions = (originalProduct as any)?.dimensions || {};
      const originalLogistics = (originalProduct as any)?.logistics || {};

      let dimensions: any = undefined;
      if (w || h || d || wt) {
        dimensions = {
          ...originalDimensions,
          widthCm: w || 0,
          heightCm: h || 0,
          depthCm: d || 0,
          weightKg: wt || 10,
        };

        const pw = Number(form.packageWidthCm);
        const ph = Number(form.packageHeightCm);
        const pd = Number(form.packageDepthCm);
        const pwt = Number(form.packageWeightKg);

        if (pw || ph || pd || pwt) {
          dimensions.packageDimensions = {
            ...(originalDimensions.packageDimensions || {}),
            widthCm: pw || 0,
            heightCm: ph || 0,
            depthCm: pd || 0,
            weightKg: pwt || 10,
          };
        }
      }

      const minDays = Number(form.deliveryMinDays);
      const maxDays = Number(form.deliveryMaxDays);

      const logistics = {
        ...originalLogistics,
        deliveryTimeDays: {
          ...(originalLogistics.deliveryTimeDays || {}),
          min: minDays || 2,
          max: maxDays || 7,
        },
        deliveryType: form.deliveryType || "home",
        shippingZones: originalLogistics.shippingZones || ["CABA", "GBA"],
        assembly: {
          ...(originalLogistics.assembly || {}),
          included: form.assemblyIncluded,
          price: form.assemblyPrice ? Number(form.assemblyPrice) : undefined,
          estimatedTimeMinutes: form.assemblyTimeMinutes ? Number(form.assemblyTimeMinutes) : undefined,
          difficulty: form.assemblyDifficulty || "easy",
        },
        packaging: {
          ...(originalLogistics.packaging || {}),
          piecesCount: Number(form.piecesCount) || 1,
          specialHandling: form.specialHandling,
        },
      };

      const payload = {
        storeId: Number(form.storeId), name: form.name, slug: form.slug,
        description: form.description || undefined, category: form.category || undefined,
        room: form.room || undefined, style: form.style || undefined, color: form.color || undefined,
        featured: form.featured, price: Number(form.price),
        arUrl: form.arUrl || undefined, glbUrl: form.glbUrl || undefined, usdzUrl: form.usdzUrl || undefined,
        imageUrl: form.imageUrl || undefined,
        dimensions: dimensions || undefined,
        logistics: logistics,
        images: form.images.filter((i) => i.url).map((i) => ({ url: i.url, type: i.type || undefined })),
        inStock: form.inStock, stockQty: form.stockQty ? Number(form.stockQty) : undefined,
        // Nuevos campos de variantes
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          name: v.name,
          color: v.color,
          fabric: v.fabric,
          size: v.size,
          finish: v.finish,
          listPrice: v.listPrice,
          salePrice: v.salePrice,
          currency: v.currency,
          stock: v.stock,
          isDefault: v.isDefault,
          images: v.images,
        })),
      };
      const tol = Number(settings.tolerance ?? "0.05") || 0.05;
      const isEdit = Boolean(form.id);
      const url = isEdit ? `${apiBase}/api/admin/products/${form.id}?tolerance=${tol}` : `${apiBase}/api/admin/products?tolerance=${tol}`;
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = data.details ? `Validation Error: ${JSON.stringify(data.details)}` : data.error || data.message || `Error ${res.status}`;
        setError(errorMsg);
        return;
      }
      await loadProducts();
      closeDrawer();
    } catch (err) { setError((err as Error).message); }
    finally { setSaving(false); }
  };

  // ─── CSV ───
  const exportCsv = async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/products?limit=all`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al descargar el catálogo completo");
      const data = await res.json();
      const allProducts = data.items || [];
      if (!allProducts.length) return;
      const fields = ["id", "storeId", "name", "slug", "price", "category", "room", "style", "arUrl", "glbUrl", "usdzUrl", "imageUrl", "inStock", "stockQty", "widthCm", "depthCm", "heightCm", "weightKg"];
      const csv = [fields.join(","), ...allProducts.map((p: any) => fields.map((f) => `"${String(p[f] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = "productos.csv";
      a.click();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;

      // Parser CSV robusto que soporta saltos de línea internos y comillas dobles
      const parseCSV = (csvText: string): string[][] => {
        const result: string[][] = [];
        let row: string[] = [];
        let current = "";
        let inQuotes = false;
        
        for (let i = 0; i < csvText.length; i++) {
          const char = csvText[i];
          const nextChar = csvText[i + 1];
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"';
              i++; // omitir comilla duplicada
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            row.push(current.trim());
            current = "";
          } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
              i++;
            }
            row.push(current.trim());
            if (row.length > 1 || row[0] !== "") {
              result.push(row);
            }
            row = [];
            current = "";
          } else {
            current += char;
          }
        }
        
        if (row.length > 0 || current !== "") {
          row.push(current.trim());
          result.push(row);
        }
        
        return result;
      };

      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        alert("El archivo CSV está vacío o es inválido");
        return;
      }
      
      const headers = parsed[0];
      const rows = parsed.slice(1);
      
      // Validar consistencia de columnas
      const inconsistentRowIndex = rows.findIndex((r) => r.length !== headers.length);
      if (inconsistentRowIndex !== -1) {
        alert(`Error de Consistencia: La fila ${inconsistentRowIndex + 2} tiene ${rows[inconsistentRowIndex].length} columnas, pero la cabecera espera ${headers.length} columnas.`);
        return;
      }

      setPreviewHeaders(headers);
      setPreviewRows(rows.slice(0, 5));
      setPendingImportRows(rows);
      setSelectedImportIndices(new Set(rows.map((_, idx) => idx)));
      setImportStoreId("");
      setShowImportPreview(true);
    };
    reader.readAsText(file);
  };

  const submitImport = async () => {
    if (!user || !pendingImportRows.length) return;

    // Validación previa para SUPER_ADMIN: debe haber seleccionado una tienda si alguna fila seleccionada no tiene storeId
    if (user.role === "SUPER_ADMIN" && !importStoreId && pendingImportRows.some((row, ri) => {
      if (!selectedImportIndices.has(ri)) return false;
      const storeIdIdx = previewHeaders.indexOf("storeId");
      return storeIdIdx === -1 || !row[storeIdIdx];
    })) {
      setImportErrors(["Debe seleccionar una tienda para asignar los productos importados sin tienda."]);
      return;
    }

    setSaving(true);
    setImportErrors([]);
    try {
      const items = pendingImportRows
        .filter((_, ri) => selectedImportIndices.has(ri))
        .map((row) => { const o: any = {}; previewHeaders.forEach((h, i) => { if (row[i]) o[h] = row[i]; }); return o; })
        .filter((o) => Object.keys(o).length)
        .map((o) => ({
          ...o,
          id: o.id ? Number(o.id) : undefined,
          storeId: o.storeId ? Number(o.storeId) : (user.role === "SUPER_ADMIN" ? Number(importStoreId) : (user.storeId || undefined)),
          price: o.price ? Number(o.price) : 0,
          stockQty: o.stockQty ? Number(o.stockQty) : undefined,
          inStock: o.inStock ? String(o.inStock).toLowerCase() === "true" : true,
        }));
      const valid = items.filter((i) => i.name && i.slug && i.price !== undefined);
      if (!valid.length) { setImportErrors(["No hay items válidos. Necesita 'name', 'slug' y 'price'."]); return; }
      const res = await fetch(`${apiBase}/api/admin/products/bulk`, { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(valid) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setImportErrors([(data as any).error || `Error ${res.status}`]); return; }
      setShowImportPreview(false);
      await loadProducts();
    } catch (err) { setImportErrors([(err as Error).message]); }
    finally { setSaving(false); }
  };

  // ─── Bulk actions ───
  const applyBulkAction = async (action: "delete" | "featured" | "unfeatured" | "inStock" | "outStock") => {
    if (!selectedIds.size) return;
    if (action === "delete" && !confirm(`¿Borrar ${selectedIds.size} productos?`)) return;
    for (const id of Array.from(selectedIds)) {
      if (action === "delete") await fetch(`${apiBase}/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
      else if (action === "featured") await updateProductField(id, { featured: true });
      else if (action === "unfeatured") await updateProductField(id, { featured: false });
      else if (action === "inStock") await updateProductField(id, { inStock: true });
      else if (action === "outStock") await updateProductField(id, { inStock: false });
    }
    await loadProducts();
    setSelectedIds(new Set());
  };

  const handleSort = (field: "name" | "price" | "id") => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  // ─── Form field helper ───
  const F = (label: string, field: keyof FormState, opts?: { type?: string; placeholder?: string; span?: number; rows?: number; list?: string }) => (
    <div className={opts?.span ? `sm:col-span-${opts.span}` : ""} style={opts?.span ? { gridColumn: `span ${opts.span}` } : undefined}>
      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      {opts?.rows ? (
        <textarea
          rows={opts.rows}
          placeholder={opts?.placeholder}
          value={String(form[field] ?? "")}
          onChange={(e) => { setForm((f) => ({ ...f, [field]: e.target.value })); setFormErrors((fe) => { const { [field]: _, ...r } = fe; return r; }); }}
          className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/10 transition-all ${formErrors[field] ? "border-red-300" : "border-slate-200"}`}
        />
      ) : (
        <input
          type={opts?.type || "text"}
          placeholder={opts?.placeholder}
          value={String(form[field] ?? "")}
          list={opts?.list}
          onChange={(e) => {
            const val = e.target.value;
            setForm((f) => {
              const next = { ...f, [field]: val };
              if (field === "name" && (!f.slug || slugify(f.slug) === slugify(f.name))) next.slug = slugify(val);
              return next;
            });
            setFormErrors((fe) => { const { [field]: _, ...r } = fe; return r; });
          }}
          className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/10 transition-all ${formErrors[field] ? "border-red-300" : "border-slate-200"}`}
        />
      )}
      {formErrors[field] && <p className="text-[10px] text-red-600 mt-0.5">{formErrors[field]}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Inventario</h1>
          <p className="text-sm text-slate-500">{products.length} productos · Página {page}/{totalPages}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCsv} disabled={!products.length} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
            <Download size={16} /> Exportar CSV
          </button>
          <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
            <Upload size={16} /> Importar CSV
            <input type="file" accept="text/csv" className="hidden" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); }} />
          </label>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0058a3] text-white text-sm font-bold hover:bg-[#004f93] transition-all active:scale-[0.98]">
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>}

      {/* Filters + Tabs row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search + filters */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por nombre, ID, slug..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/10 transition-all" />
          </div>
          <div className="relative">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0058a3] cursor-pointer bg-white">
              <option value="">Categoría</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterInStock} onChange={(e) => setFilterInStock(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0058a3] cursor-pointer bg-white">
              <option value="">Stock</option>
              <option value="yes">En stock</option>
              <option value="no">Agotado</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? "bg-white text-[#0058a3] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 bg-[#0058a3]/5 border border-[#0058a3]/20 rounded-xl px-4 py-2 text-xs">
          <span className="font-bold text-[#0058a3]">{selectedIds.size} seleccionado{selectedIds.size > 1 ? "s" : ""}</span>
          <span className="text-slate-300">|</span>
          <button onClick={() => applyBulkAction("featured")} className="text-slate-700 hover:text-slate-900 font-semibold">★ Destacar</button>
          <button onClick={() => applyBulkAction("unfeatured")} className="text-slate-700 hover:text-slate-900 font-semibold">☆ Quitar</button>
          <button onClick={() => applyBulkAction("inStock")} className="text-emerald-700 hover:text-emerald-900 font-semibold">En stock</button>
          <button onClick={() => applyBulkAction("outStock")} className="text-amber-700 hover:text-amber-900 font-semibold">Sin stock</button>
          <button onClick={() => applyBulkAction("delete")} className="text-red-600 hover:text-red-800 font-semibold ml-auto">Borrar</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 last:border-0">
                <div className="h-4 w-4 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-200 rounded" />
                <div className="h-4 w-40 bg-slate-200 rounded flex-1" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
                <div className="h-6 w-16 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : pagedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Package size={24} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">{searchTerm || filterCategory || filterInStock ? "Sin resultados" : "Sin productos"}</h3>
            <p className="text-xs text-slate-500 max-w-[240px] mb-4">
              {searchTerm || filterCategory || filterInStock ? "Probá con otros filtros." : "Agregá tu primer producto para empezar."}
            </p>
            {!searchTerm && !filterCategory && !filterInStock && (
              <button onClick={openCreate} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0058a3] bg-[#0058a3]/5 px-4 py-2 rounded-full hover:bg-[#0058a3]/10 transition-colors">
                <Plus size={14} /> Agregar producto
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className={`hidden sm:grid ${gridClassName} gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider items-center rounded-t-xl`}>
              <div className="text-center">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-[#0058a3] focus:ring-[#0058a3] cursor-pointer"
                  checked={pagedProducts.length > 0 && pagedProducts.every((p) => selectedIds.has(p.id))}
                  onChange={(e) => setSelectedIds(e.target.checked ? new Set(pagedProducts.map((p) => p.id)) : new Set())} />
              </div>
              <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-slate-700 transition-colors text-left focus:outline-none">
                Producto {sortField === "name" && (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
              </button>
              {activeTab === "general" && (
                <>
                  <button onClick={() => handleSort("price")} className="flex items-center gap-1 hover:text-slate-700 transition-colors focus:outline-none">
                    Precio {sortField === "price" && (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                  </button>
                  <span>Categoría</span>
                  {user?.role === "SUPER_ADMIN" && <span>Tienda</span>}
                </>
              )}
              {activeTab === "ar" && (
                <>
                  <span className="text-center">Estado AR</span>
                  <span className="text-center">Medidas</span>
                  <span className="text-center">Link</span>
                </>
              )}
              {activeTab === "stock" && (
                <>
                  <span className="text-center">Stock</span>
                  <span className="text-center">Cantidad</span>
                  <span className="text-center">Estado</span>
                </>
              )}
              <span className="text-right">Acciones</span>
            </div>

            {/* Rows */}
            {pagedProducts.map((p) => {
              const vr = validation[p.id];
              const hasDim = p.widthCm || p.depthCm || p.heightCm;

              return (
                <div 
                  key={p.id} 
                  className={`grid grid-cols-1 sm:grid ${gridClassName} gap-2 px-4 py-3 border-b border-slate-100 last:border-0 items-center transition-all duration-150 ${selectedIds.has(p.id) ? "bg-[#0058a3]/5 hover:bg-[#0058a3]/8" : "bg-white hover:bg-slate-50/70"}`}
                >
                  {/* Checkbox */}
                  <div className="text-center hidden sm:block">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-[#0058a3] focus:ring-[#0058a3] cursor-pointer"
                      checked={selectedIds.has(p.id)}
                      onChange={(e) => { const n = new Set(selectedIds); e.target.checked ? n.add(p.id) : n.delete(p.id); setSelectedIds(n); }} />
                  </div>

                  {/* Product name */}
                  <div className="flex items-center gap-3 min-w-0">
                    {p.imageUrl ? (
                      <div className="overflow-hidden rounded-lg h-9 w-9 border border-slate-200 shrink-0 cursor-pointer" onClick={() => setPreviewImageUrl(p.imageUrl || null)}>
                        <img src={p.imageUrl} alt="" className="h-full w-full object-cover hover:scale-110 transition-transform duration-200" />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/50"><ImageIcon size={14} className="text-slate-400" /></div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">#{p.id} · {p.slug}</p>
                    </div>
                  </div>

                  {/* General tab columns */}
                  {activeTab === "general" && (
                    <>
                      <span className="text-sm font-bold text-slate-900 hidden sm:block">${Number(p.price).toLocaleString("es-AR")}</span>
                      <div className="hidden sm:flex flex-col gap-0.5">
                        {p.category && <span className="inline-flex w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{p.category}</span>}
                        {p.room && <span className="text-[10px] text-slate-500">{p.room}</span>}
                      </div>
                      {user?.role === "SUPER_ADMIN" && <span className="text-xs text-slate-600 hidden sm:block truncate">{p.store?.name || "—"}</span>}
                    </>
                  )}

                  {/* AR tab columns */}
                  {activeTab === "ar" && (
                    <>
                      <div className="text-center hidden sm:block">
                        {(p.glbUrl || p.arUrl) ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            {p.glbUrl && p.usdzUrl ? "GLB+USDZ" : p.glbUrl ? "GLB" : "USDZ"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            <XCircle size={12} className="text-red-500" /> Sin AR
                          </span>
                        )}
                      </div>
                      <div className="text-center hidden sm:block text-xs text-slate-600">
                        {hasDim ? `${p.widthCm ?? "?"}×${p.depthCm ?? "?"}×${p.heightCm ?? "?"}` : <span className="text-amber-600 font-semibold text-[10px]"><AlertTriangle size={10} className="inline" /> Sin medidas</span>}
                      </div>
                      <div className="text-center hidden sm:block">
                        {(p.glbUrl || p.arUrl) ? (
                          <button
                            onClick={() => copyARLink(p)}
                            disabled={copyingId === p.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#0058a3]/10 text-slate-500 hover:text-[#0058a3] transition-colors disabled:opacity-50"
                            title="Copiar link AR"
                          >
                            {copyingId === p.id ? <Loader size={14} className="animate-spin" /> : <Copy size={14} />}
                          </button>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Stock tab columns */}
                  {activeTab === "stock" && (
                    <>
                      <div className="text-center hidden sm:block">
                        {(p.stockQty ?? 0) === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            <XCircle size={12} className="text-red-500" />
                            Agotado
                          </span>
                        ) : (p.stockQty ?? 0) < 5 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <AlertTriangle size={12} className="text-amber-500" />
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            En Stock
                          </span>
                        )}
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => updateProductField(p.id, { stockQty: Math.max(0, (p.stockQty ?? 0) - 1) })}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors">−</button>
                          <span className={`text-sm font-bold w-8 text-center ${(p.stockQty ?? 0) === 0 ? "text-red-600" : (p.stockQty ?? 0) < 5 ? "text-amber-500" : "text-slate-900"}`}>{p.stockQty ?? 0}</span>
                          <button onClick={() => updateProductField(p.id, { stockQty: (p.stockQty ?? 0) + 1 })}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors">+</button>
                        </div>
                      </div>
                      <div className="text-center hidden sm:block">
                        <span className={`text-xs font-semibold ${(p.stockQty ?? 0) === 0 ? "text-red-500" : (p.stockQty ?? 0) < 5 ? "text-amber-600" : "text-emerald-600"}`}>
                          {(p.stockQty ?? 0) === 0 ? "Sin inventario" : "Disponible"}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    {activeTab === "ar" && (
                      <>
                        {p.arUrl && (
                          <ARPreview arUrl={p.arUrl ?? undefined} glbUrl={p.glbUrl ?? undefined} usdzUrl={p.usdzUrl ?? undefined} productId={p.id} productName={p.name} widthCm={p.widthCm ?? undefined} depthCm={p.depthCm ?? undefined} heightCm={p.heightCm ?? undefined} />
                        )}
                        {p.arUrl && (
                          <button onClick={() => validate(p)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-colors" title="Validar escala">
                            <Check size={14} />
                          </button>
                        )}
                        <button onClick={() => setAiGeneratorProduct(p)} className="w-7 h-7 rounded-lg bg-blue-50/50 hover:bg-blue-50 text-blue-500 hover:text-blue-600 flex items-center justify-center transition-colors" title="Generar Modelo 3D con IA">
                          <Sparkles size={14} />
                        </button>
                      </>
                    )}
                    {p.featured ? (
                      <button onClick={() => updateProductField(p.id, { featured: false })} title="Quitar destacado" className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><Star size={14} fill="currentColor" /></button>
                    ) : (
                      <button onClick={() => updateProductField(p.id, { featured: true })} title="Destacar" className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-400 hover:text-amber-500 flex items-center justify-center transition-colors"><Star size={14} /></button>
                    )}
                    <button onClick={() => openEdit(p)} title="Editar" className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#0058a3]/10 text-slate-500 hover:text-[#0058a3] flex items-center justify-center transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => { setLogProductId(p.id); setShowLogModal(true); }} title="Historial" className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"><History size={14} /></button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      disabled={deletingIds.has(p.id)}
                      title="Borrar"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      {deletingIds.has(p.id) ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>

                  {/* Validation result (AR tab only) */}
                  {activeTab === "ar" && vr && (
                    <div className="sm:col-start-2 sm:col-span-5 text-xs pb-1">
                      {"error" in vr ? (
                        <span className="text-red-600 flex items-center gap-1">❌ {vr.error}</span>
                      ) : vr.ok ? (
                        <span className="text-emerald-600 flex items-center gap-1">✅ Escala OK</span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">⚠️ Error de escala {vr.suggestion?.factor ? `(sugiere ×${vr.suggestion.factor.toFixed(3)})` : ""}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200">
              <span>Página {page} de {totalPages} · {sortedProducts.length} resultado{sortedProducts.length !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40">← Anterior</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40">Siguiente →</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Image preview overlay ── */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreviewImageUrl(null)}>
          <img src={previewImageUrl} className="max-h-[85vh] max-w-[85vw] rounded-xl shadow-2xl" alt="" />
        </div>
      )}

      {/* ── AI 3D Generator Modal ── */}
      {aiGeneratorProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAiGeneratorProduct(null)}>
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900">Generación 3D Inteligente</h2>
                <p className="text-xs text-slate-500">Producto: <span className="font-semibold text-slate-700">{aiGeneratorProduct.name}</span></p>
              </div>
              <button 
                onClick={() => setAiGeneratorProduct(null)} 
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <AI3DGenerator 
                productId={aiGeneratorProduct.id} 
                productName={aiGeneratorProduct.name}
                currentImageUrl={aiGeneratorProduct.imageUrl} 
                currentArUrl={aiGeneratorProduct.arUrl} 
                currentGlbUrl={aiGeneratorProduct.glbUrl} 
                currentUsdzUrl={aiGeneratorProduct.usdzUrl}
                onSuccess={(glbUrl, usdzUrl) => { 
                  setProducts(prev => prev.map(pr => pr.id === aiGeneratorProduct.id ? { ...pr, glbUrl, usdzUrl: usdzUrl || "" } : pr));
                  loadProducts();
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Product Log Modal ── */}
      {showLogModal && logProductId && (
        <ProductLogModal productId={logProductId} apiBase={apiBase} onClose={() => setShowLogModal(false)} />
      )}

      {/* ── CSV Import Preview Modal ── */}
      {/* ── CSV Import Preview Modal ── */}
      {showImportPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowImportPreview(false)}>
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900">Vista previa de importación</h2>
              <p className="text-xs text-slate-500">{pendingImportRows.length} filas encontradas | <strong>{selectedImportIndices.size}</strong> seleccionadas</p>
            </div>
            {/* Super Admin Store Selector inside Import Modal */}
            {user?.role === "SUPER_ADMIN" && (
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 flex-shrink-0">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Asignar a Tienda (Superadmin):</label>
                <select
                  value={importStoreId}
                  onChange={(e) => setImportStoreId(e.target.value)}
                  className="flex-1 max-w-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0058a3] bg-white"
                >
                  <option value="">Seleccionar tienda...</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Store capacity info banner */}
            {capacityInfo && (
              <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
                <span>
                  Tienda: <strong className="text-slate-900">{currentStore?.name}</strong> | Catálogo actual: <strong>{capacityInfo.current}</strong> de <strong>{capacityInfo.max}</strong> productos
                </span>
                <span>
                  Capacidad restante: <strong className={capacityInfo.remaining === 0 ? "text-red-600 font-bold" : "text-slate-900"}>{capacityInfo.remaining}</strong> productos
                </span>
              </div>
            )}
            <div className="px-6 py-4 overflow-auto flex-grow">
              {/* Capacity Limit Warning */}
              {capacityInfo && selectedImportIndices.size > capacityInfo.remaining && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex flex-col gap-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <span>⚠️ Límite de catálogo excedido</span>
                  </div>
                  <p>
                    Has seleccionado <strong>{selectedImportIndices.size}</strong> productos para importar, pero tu plan actual solo tiene capacidad para <strong>{capacityInfo.remaining}</strong> producto(s) adicionales.
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Sugerencia: Desmarca algunos productos en la lista inferior hasta que no superes la capacidad restante o ve a la pestaña de <strong>Plan y créditos</strong> para mejorar tu plan de suscripción.
                  </p>
                </div>
              )}

              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-2 py-1.5 bg-slate-50 font-bold text-slate-600 text-left w-10">
                      <input
                        type="checkbox"
                        checked={pendingImportRows.length > 0 && selectedImportIndices.size === pendingImportRows.length}
                        onChange={toggleSelectAllImport}
                        className="rounded text-[#0058a3] focus:ring-[#0058a3] cursor-pointer"
                      />
                    </th>
                    {previewHeaders.map((h) => (
                      <th key={h} className="px-2 py-1.5 bg-slate-50 font-bold text-slate-600 text-left">{headerTranslations[h] || h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingImportRows.map((r, ri) => (
                    <tr 
                      key={ri} 
                      className={`hover:bg-slate-50/50 cursor-pointer ${selectedImportIndices.has(ri) ? "bg-white" : "bg-slate-50/30 opacity-60"}`}
                      onClick={() => toggleSelectImportRow(ri)}
                    >
                      <td className="px-2 py-1.5 border-t border-slate-100 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedImportIndices.has(ri)}
                          onChange={() => toggleSelectImportRow(ri)}
                          className="rounded text-[#0058a3] focus:ring-[#0058a3] cursor-pointer"
                        />
                      </td>
                      {r.map((v, ci) => {
                        const formatted = formatPreviewValue(previewHeaders[ci], v);
                        return (
                          <td key={ci} className="px-2 py-1.5 border-t border-slate-100 max-w-[150px] truncate" title={formatted}>
                            {formatted}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {importErrors.length > 0 && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                  {importErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 flex-shrink-0 bg-slate-50/50">
              <button onClick={() => setShowImportPreview(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
              <button 
                onClick={submitImport} 
                disabled={saving || selectedImportIndices.size === 0 || (capacityInfo !== null && selectedImportIndices.size > capacityInfo.remaining)} 
                className="px-4 py-2 rounded-xl bg-[#0058a3] text-white text-sm font-bold hover:bg-[#004f93] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}Confirmar importación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-out Product Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h2 className="text-lg font-bold text-slate-900">{form.id ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={closeDrawer} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"><X size={16} /></button>
            </div>

            {/* Drawer body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tienda</label>
                  <select disabled={user?.role !== "SUPER_ADMIN"} value={form.storeId ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value ? Number(e.target.value) : undefined }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0058a3] ${formErrors.storeId ? "border-red-300" : "border-slate-200"}`}>
                    <option value="">Seleccionar</option>
                    {((user && user.role !== "SUPER_ADMIN" && user.storeId) ? stores.filter((s) => s.id === user.storeId) : stores).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {formErrors.storeId && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.storeId}</p>}
                </div>
                {F("Nombre", "name")}
                {F("Slug", "slug")}
              </div>
              {F("Descripción", "description", { rows: 2, span: 2 })}
              <div className="grid grid-cols-3 gap-3">
                {F("Precio", "price", { type: "number" })}
                {F("Categoría", "category", { list: "category-recommendations" })}
                {F("Ambiente", "room", { list: "room-recommendations" })}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {F("Estilo", "style", { list: "style-recommendations" })}
                {F("Color", "color", { list: "color-recommendations" })}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Stock</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.inStock} onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))} className="h-4 w-4 rounded accent-emerald-500" />
                    <input type="number" placeholder="Qty" value={form.stockQty} onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))}
                      className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]" />
                  </div>
                </div>
              </div>

              {/* Dimensions & Weight */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/30 space-y-3">
                <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">Dimensiones Físicas y Peso</p>
                <div className="grid grid-cols-4 gap-2">
                  {F("Ancho", "widthCm", { type: "number" })}
                  {F("Prof.", "depthCm", { type: "number" })}
                  {F("Alto", "heightCm", { type: "number" })}
                  {F("Peso (kg)", "weightKg", { type: "number", placeholder: "10" })}
                </div>
              </div>

              {/* Packaging Dimensions */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/30 space-y-3">
                <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">Dimensiones de Embalaje (Caja)</p>
                <div className="grid grid-cols-4 gap-2">
                  {F("Ancho", "packageWidthCm", { type: "number" })}
                  {F("Prof.", "packageDepthCm", { type: "number" })}
                  {F("Alto", "packageHeightCm", { type: "number" })}
                  {F("Peso (kg)", "packageWeightKg", { type: "number" })}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {F("Bultos", "piecesCount", { type: "number", placeholder: "1" })}
                  <div className="flex items-center gap-2 pt-5">
                    <input type="checkbox" id="specialHandling" checked={form.specialHandling}
                      onChange={(e) => setForm((f) => ({ ...f, specialHandling: e.target.checked }))}
                      className="h-4 w-4 rounded accent-[#0058a3]" />
                    <label htmlFor="specialHandling" className="text-xs font-semibold text-slate-700 cursor-pointer">Cuidado Especial</label>
                  </div>
                </div>
              </div>

              {/* Logistics & Delivery */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/30 space-y-3">
                <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">Logística de Entrega</p>
                <div className="grid grid-cols-3 gap-2">
                  {F("Días Mín.", "deliveryMinDays", { type: "number", placeholder: "2" })}
                  {F("Días Máx.", "deliveryMaxDays", { type: "number", placeholder: "7" })}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tipo Envío</label>
                    <select value={form.deliveryType}
                      onChange={(e) => setForm((f) => ({ ...f, deliveryType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3] bg-white">
                      <option value="home">A Domicilio</option>
                      <option value="branch">A Sucursal</option>
                      <option value="pickup">Retiro Local</option>
                      <option value="multiple">Múltiple</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Assembly info */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/30 space-y-3">
                <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">Servicio de Armado</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" id="assemblyIncluded" checked={form.assemblyIncluded}
                      onChange={(e) => setForm((f) => ({ ...f, assemblyIncluded: e.target.checked }))}
                      className="h-4 w-4 rounded accent-[#0058a3]" />
                    <label htmlFor="assemblyIncluded" className="text-xs font-semibold text-slate-700 cursor-pointer">Armado Incluido</label>
                  </div>
                  {!form.assemblyIncluded && F("Precio ($)", "assemblyPrice", { type: "number", placeholder: "Opcional" })}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {F("Tiempo (min)", "assemblyTimeMinutes", { type: "number", placeholder: "Ej. 45" })}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Dificultad</label>
                    <select value={form.assemblyDifficulty}
                      onChange={(e) => setForm((f) => ({ ...f, assemblyDifficulty: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3] bg-white">
                      <option value="easy">Fácil</option>
                      <option value="medium">Medio</option>
                      <option value="professional">Profesional</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Variants Manager */}
              <div className="border-t border-slate-200 pt-4">
                <VariantManager
                  variants={variants}
                  productName={form.name}
                  onChange={setVariants}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Imagen principal</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://..." value={form.imageUrl}
                    onChange={(e) => { setForm((f) => ({ ...f, imageUrl: e.target.value })); setFormErrors((fe) => { const { imageUrl: _, ...r } = fe; return r; }); }}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0058a3] ${formErrors.imageUrl ? "border-red-300" : "border-slate-200"}`} />
                  <FileUpload apiBase={apiBase} endpoint="/api/upload/image" accept="image/*" buttonText="Subir"
                    onUploadSuccess={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
                </div>
                {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-20 rounded-lg object-cover border" />}
              </div>

              {/* AR URLs - Separate GLB and USDZ fields */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Modelo AR GLB</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://...modelo.glb" value={form.glbUrl}
                    onChange={(e) => { setForm((f) => ({ ...f, glbUrl: e.target.value })); setFormErrors((fe) => { const { glbUrl: _, ...r } = fe; return r; }); }}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0058a3] ${formErrors.glbUrl ? "border-red-300" : "border-slate-200"}`} />
                  <FileUpload apiBase={apiBase} endpoint="/api/upload/model" accept=".glb" buttonText="Subir GLB"
                    onUploadSuccess={(url) => setForm((f) => ({ ...f, glbUrl: url }))} />
                </div>
                {formErrors.glbUrl && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.glbUrl}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Modelo AR USDZ (iOS)</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://...modelo.usdz" value={form.usdzUrl}
                    onChange={(e) => { setForm((f) => ({ ...f, usdzUrl: e.target.value })); setFormErrors((fe) => { const { usdzUrl: _, ...r } = fe; return r; }); }}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0058a3] ${formErrors.usdzUrl ? "border-red-300" : "border-slate-200"}`} />
                  <FileUpload apiBase={apiBase} endpoint="/api/upload/model" accept=".usdz" buttonText="Subir USDZ"
                    onUploadSuccess={(url) => setForm((f) => ({ ...f, usdzUrl: url }))} />
                </div>
                {formErrors.usdzUrl && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.usdzUrl}</p>}
              </div>

              {/* Legacy AR URL field (for backward compatibility) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Modelo AR (Legacy - JSON)</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://...modelo.glb (o JSON legacy)" value={form.arUrl}
                    onChange={(e) => { setForm((f) => ({ ...f, arUrl: e.target.value })); setFormErrors((fe) => { const { arUrl: _, ...r } = fe; return r; }); }}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0058a3] ${formErrors.arUrl ? "border-red-300" : "border-slate-200"}`} />
                  <FileUpload apiBase={apiBase} endpoint="/api/upload/model" accept=".glb,.usdz" buttonText="Subir"
                    onUploadSuccess={(url) => setForm((f) => ({ ...f, arUrl: url }))} />
                </div>
                {formErrors.arUrl && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.arUrl}</p>}
              </div>

              {/* AI 3D Generator */}
              {form.id && (
                <AI3DGenerator productId={form.id} productName={form.name || "Product"}
                  currentImageUrl={form.imageUrl} currentArUrl={form.arUrl} currentGlbUrl={form.glbUrl} currentUsdzUrl={form.usdzUrl}
                  onSuccess={(glbUrl, usdzUrl) => { setForm((f) => ({ ...f, glbUrl: glbUrl, usdzUrl: usdzUrl || "" })); loadProducts(); }} />
              )}

              {/* Featured toggle */}
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="h-4 w-4 rounded accent-amber-500" />
                <span className="text-sm font-semibold text-slate-700">Producto destacado</span>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button onClick={closeDrawer} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={submitForm} disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#0058a3] text-white text-sm font-bold hover:bg-[#004f93] transition-colors shadow-sm disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                {form.id ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Datalists de sugerencias */}
      <datalist id="category-recommendations">
        <option value="Sillas" />
        <option value="Sillones" />
        <option value="Mesas" />
        <option value="Escritorios" />
        <option value="Camas" />
        <option value="Armarios" />
        <option value="Cómodas" />
        <option value="Mesas de luz" />
        <option value="Sofás" />
        <option value="Estanterías" />
      </datalist>

      <datalist id="room-recommendations">
        <option value="Living" />
        <option value="Comedor" />
        <option value="Dormitorio" />
        <option value="Oficina" />
        <option value="Cocina" />
        <option value="Exterior" />
        <option value="Infantil" />
      </datalist>

      <datalist id="style-recommendations">
        <option value="Moderno" />
        <option value="Escandinavo" />
        <option value="Rústico" />
        <option value="Industrial" />
        <option value="Minimalista" />
        <option value="Clásico" />
        <option value="Vintage" />
      </datalist>

      <datalist id="color-recommendations">
        <option value="Rojo" />
        <option value="Azul" />
        <option value="Verde" />
        <option value="Amarillo" />
        <option value="Negro" />
        <option value="Blanco" />
        <option value="Gris" />
        <option value="Beige" />
        <option value="Marrón" />
        <option value="Naranja" />
        <option value="Rosa" />
        <option value="Violeta" />
        <option value="Roble" />
        <option value="Wengue" />
        <option value="Haya" />
        <option value="Paraíso" />
        <option value="Pino" />
      </datalist>
    </div>
  );
}