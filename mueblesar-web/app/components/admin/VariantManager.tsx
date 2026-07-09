"use client";

import { useState, useCallback } from "react";
import { Plus, X, Image as ImageIcon, GripVertical, Copy } from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface VariantImage {
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface ProductVariantForm {
  id?: string; // undefined para nuevas, string para existentes
  sku: string;
  name: string;
  color?: string;
  fabric?: string;
  size?: string;
  finish?: string;
  listPrice: number;
  salePrice: number;
  currency: string;
  stock: number;
  isDefault: boolean;
  images: VariantImage[];
}

interface VariantManagerProps {
  variants: ProductVariantForm[];
  productName: string;
  onChange: (variants: ProductVariantForm[]) => void;
}

// ============================================
// UTILS
// ============================================

const generateVariantName = (productName: string, attrs: { color?: string; size?: string; fabric?: string; finish?: string }) => {
  const parts = [productName];
  if (attrs.color) parts.push(attrs.color);
  if (attrs.size) parts.push(attrs.size);
  if (attrs.fabric) parts.push(attrs.fabric);
  if (attrs.finish) parts.push(attrs.finish);
  return parts.join(" - ");
};

const generateSKU = (productSlug: string, attrs: { color?: string; size?: string }) => {
  const parts = [productSlug.toUpperCase().replace(/-/g, "")];
  if (attrs.color) parts.push(attrs.color.substring(0, 3).toUpperCase());
  if (attrs.size) parts.push(attrs.size.substring(0, 2).toUpperCase());
  return parts.join("-");
};

// ============================================
// COMPONENT
// ============================================

export function VariantManager({ variants, productName, onChange }: VariantManagerProps) {
  const [expandedVariant, setExpandedVariant] = useState<number | null>(0);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const addVariant = useCallback(() => {
    const newVariant: ProductVariantForm = {
      sku: "",
      name: `${productName} - Variante`,
      color: "",
      size: "",
      listPrice: 0,
      salePrice: 0,
      currency: "ARS",
      stock: 0,
      isDefault: variants.length === 0, // Primera es default
      images: [],
    };
    onChange([...variants, newVariant]);
    setExpandedVariant(variants.length);
  }, [variants, productName, onChange]);

  const removeVariant = useCallback((index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    // Asegurar que al menos una sea default
    if (newVariants.length > 0 && !newVariants.some((v) => v.isDefault)) {
      newVariants[0].isDefault = true;
    }
    onChange(newVariants);
  }, [variants, onChange]);

  const duplicateVariant = useCallback((index: number) => {
    const variant = variants[index];
    const newVariant: ProductVariantForm = {
      ...variant,
      id: undefined, // Nueva variante
      name: `${variant.name} (copia)`,
      sku: `${variant.sku}-COPY`,
      isDefault: false,
      images: [...variant.images],
    };
    const newVariants = [...variants];
    newVariants.splice(index + 1, 0, newVariant);
    onChange(newVariants);
    setExpandedVariant(index + 1);
  }, [variants, onChange]);

  const updateVariant = useCallback((index: number, updates: Partial<ProductVariantForm>) => {
    const newVariants = [...variants];
    const variant = { ...newVariants[index], ...updates };

    // Auto-generar nombre si cambian atributos
    if (updates.color !== undefined || updates.size !== undefined || updates.fabric !== undefined || updates.finish !== undefined) {
      variant.name = generateVariantName(productName, {
        color: variant.color,
        size: variant.size,
        fabric: variant.fabric,
        finish: variant.finish,
      });
    }

    // Auto-generar SKU si está vacío y tenemos atributos
    if (!variant.sku || variant.sku.endsWith("-COPY")) {
      const slug = productName.toLowerCase().replace(/\s+/g, "-");
      variant.sku = generateSKU(slug, { color: variant.color, size: variant.size });
    }

    newVariants[index] = variant;
    onChange(newVariants);
  }, [variants, productName, onChange]);

  const setDefaultVariant = useCallback((index: number) => {
    const newVariants = variants.map((v, i) => ({
      ...v,
      isDefault: i === index,
    }));
    onChange(newVariants);
  }, [variants, onChange]);

  const addImageToVariant = useCallback((variantIndex: number, url: string) => {
    const newVariants = [...variants];
    newVariants[variantIndex].images.push({
      url,
      alt: newVariants[variantIndex].name,
      sortOrder: newVariants[variantIndex].images.length,
    });
    onChange(newVariants);
  }, [variants, onChange]);

  const removeImageFromVariant = useCallback((variantIndex: number, imageIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].images = newVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
    onChange(newVariants);
  }, [variants, onChange]);

  const colors = [
    { name: "Rojo", hex: "#EF4444" },
    { name: "Azul", hex: "#3B82F6" },
    { name: "Verde", hex: "#10B981" },
    { name: "Amarillo", hex: "#F59E0B" },
    { name: "Negro", hex: "#111827" },
    { name: "Blanco", hex: "#F9FAFB" },
    { name: "Gris", hex: "#6B7280" },
    { name: "Beige", hex: "#D4C4B7" },
    { name: "Marrón", hex: "#92400E" },
    { name: "Naranja", hex: "#F97316" },
    { name: "Rosa", hex: "#EC4899" },
    { name: "Violeta", hex: "#8B5CF6" },
  ];

  const sizes = ["1 cuerpo", "2 cuerpos", "3 cuerpos", "4 cuerpos", "King", "Queen", "Twin", "Single"];
  const fabrics = ["Lino", "Cuero", "Tela", "Gamuza", "Algodón", "Poliéster", "Microfibra", "Terciopelo"];
  const finishes = ["Mate", "Brillante", "Texturizado", "Satinado", "Rústico", "Moderno"];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Variantes del producto</h3>
          <p className="text-xs text-slate-500">
            {variants.length} variante{variants.length !== 1 ? "s" : ""} · 
            Default: {variants.find((v) => v.isDefault)?.name || "Ninguna"}
          </p>
        </div>
        <button
          onClick={addVariant}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0058a3] text-white text-xs font-semibold hover:bg-[#004f93] transition-colors"
        >
          <Plus size={14} /> Agregar variante
        </button>
      </div>

      {/* Variants List */}
      <div className="space-y-2">
        {variants.map((variant, index) => (
          <div
            key={variant.id || index}
            className={`border rounded-xl overflow-hidden transition-all ${
              variant.isDefault ? "border-[#0058a3] bg-[#0058a3]/5" : "border-slate-200 bg-white"
            }`}
          >
            {/* Header - Collapsed */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50"
              onClick={() => setExpandedVariant(expandedVariant === index ? null : index)}
            >
              <GripVertical size={16} className="text-slate-400" />

              {/* Color indicator */}
              {variant.color && (
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: colors.find((c) => c.name === variant.color)?.hex || variant.color }}
                  title={variant.color}
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 truncate">
                    {variant.name}
                  </span>
                  {variant.isDefault && (
                    <span className="px-1.5 py-0.5 rounded bg-[#0058a3] text-white text-[10px] font-bold">
                      DEFAULT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>SKU: {variant.sku || "Sin SKU"}</span>
                  <span>•</span>
                  <span>${variant.salePrice.toLocaleString("es-AR")}</span>
                  <span>•</span>
                  <span className={variant.stock > 0 ? "text-emerald-600" : "text-red-500"}>
                    Stock: {variant.stock}
                  </span>
                  {variant.images.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ImageIcon size={12} /> {variant.images.length} foto{variant.images.length !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!variant.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDefaultVariant(index);
                    }}
                    className="px-2 py-1 rounded text-[10px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    title="Establecer como default"
                  >
                    Hacer default
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateVariant(index);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#0058a3] hover:bg-[#0058a3]/10 transition-colors"
                  title="Duplicar"
                >
                  <Copy size={14} />
                </button>
                {variants.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVariant(index);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedVariant === index && (
              <div className="px-4 pb-4 border-t border-slate-100">
                <div className="pt-4 space-y-4">
                  {/* SKU and Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, { sku: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]"
                        placeholder="Ej: SOFA-NOR-RJO-3C"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Nombre de variante
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, { name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]"
                      />
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Color */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Color
                      </label>
                      <div className="grid grid-cols-6 gap-1">
                        {colors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => updateVariant(index, { color: color.name })}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              variant.color === color.name
                                ? "border-[#0058a3] ring-2 ring-[#0058a3]/20"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                      {variant.color && (
                        <p className="mt-1 text-xs text-slate-600">Seleccionado: {variant.color}</p>
                      )}
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Tamaño
                      </label>
                      <select
                        value={variant.size || ""}
                        onChange={(e) => updateVariant(index, { size: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]"
                      >
                        <option value="">Seleccionar</option>
                        {sizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Fabric */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Material / Tela
                      </label>
                      <select
                        value={variant.fabric || ""}
                        onChange={(e) => updateVariant(index, { fabric: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]"
                      >
                        <option value="">Seleccionar</option>
                        {fabrics.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Finish */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Acabado
                      </label>
                      <select
                        value={variant.finish || ""}
                        onChange={(e) => updateVariant(index, { finish: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]"
                      >
                        <option value="">Seleccionar</option>
                        {finishes.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Precio Lista
                      </label>
                      <input
                        type="number"
                        value={variant.listPrice || ""}
                        onChange={(e) => updateVariant(index, { listPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Precio Venta *
                      </label>
                      <input
                        type="number"
                        value={variant.salePrice || ""}
                        onChange={(e) => updateVariant(index, { salePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]"
                        min={0}
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Imágenes específicas de esta variante
                    </label>
                    <div className="space-y-2">
                      {variant.images.map((img, imgIndex) => (
                        <div key={imgIndex} className="flex items-center gap-2">
                          <img
                            src={img.url}
                            alt={img.alt || ""}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          />
                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) => {
                              const newImages = [...variant.images];
                              newImages[imgIndex] = { ...img, url: e.target.value };
                              updateVariant(index, { images: newImages });
                            }}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3]"
                            placeholder="URL de imagen"
                          />
                          <button
                            onClick={() => removeImageFromVariant(index, imgIndex)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const url = prompt("Ingresá la URL de la imagen:");
                          if (url) addImageToVariant(index, url);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-600 text-xs font-medium hover:border-[#0058a3] hover:text-[#0058a3] transition-colors"
                      >
                        <Plus size={14} /> Agregar imagen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {variants.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500 mb-3">Este producto no tiene variantes</p>
          <button
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0058a3] text-white text-sm font-semibold hover:bg-[#004f93] transition-colors"
          >
            <Plus size={16} /> Crear primera variante
          </button>
        </div>
      )}
    </div>
  );
}

export default VariantManager;
