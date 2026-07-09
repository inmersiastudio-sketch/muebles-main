export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Store, ChevronRight, Box, Truck, Shield, Clock, Package, Check } from "lucide-react";
import { Container } from "@/app/components/layout/Container";
import { ColorImageCarousel } from "@/app/components/media/ColorImageCarousel";
import { FavoriteButton } from "@/app/components/favorites/FavoriteButton";
import { fetchProductBySlug, fetchProducts } from "@/app/lib/api";
import { PDPViewTracker } from "@/app/components/products/PDPViewTracker";
import { ProductCard } from "@/app/components/products/ProductCard";
import { StickyAddToCart } from "@/app/components/products/StickyAddToCart";
import { AddToCartButton } from "@/app/components/cart/AddToCartButton";
import { ShareButton } from "@/app/components/products/ShareButton";
import { WhatsappInquiryButton } from "@/app/components/inquiry/WhatsappInquiryButton";
import type { Product, ProductListItem } from "@/types";

function formatPrice(value: number): string {
  return `$${(value ?? 0).toLocaleString("es-AR")}`;
}

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetail({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) return notFound();

  // El producto ya viene transformado del API
  const typedProduct = product as Product;

  const store = typedProduct.store;
  const hasAr = typedProduct.media.model3d?.glbUrl || typedProduct.media.model3d?.usdzUrl;

  // Variante default
  const defaultVariant = typedProduct.variants.find(v => v.isDefault) || typedProduct.variants[0];

  // Fetch related products
  const relatedData = await fetchProducts({
    category: typedProduct.category || undefined,
    style: typedProduct.style || undefined,
    store: store?.id ? String(store.id) : undefined,
    pageSize: 4,
  });

  const related = (relatedData.items || []).filter((p: ProductListItem) => p.id !== typedProduct.id);

  // WhatsApp message
  const message = encodeURIComponent(
    `Hola! Me interesa el ${typedProduct.name} que vi en Amobly. Precio: ${formatPrice(defaultVariant?.pricing.salePrice || 0)}. Está disponible?`
  );
  const waLink = store?.whatsapp ? `https://wa.me/${store.whatsapp}?text=${message}` : undefined;

  return (
    <div className="min-h-screen bg-white">
      <PDPViewTracker
        slug={typedProduct.slug}
        store={store?.slug}
        hasAr={!!hasAr}
        hasUsdz={!!typedProduct.media.model3d?.usdzUrl}
      />

      {/* Breadcrumbs */}
      <div className="border-b border-[var(--gray-100)]">
        <Container>
          <nav className="py-3 text-xs text-[var(--gray-500)] flex items-center gap-1.5">
            <Link href="/" className="hover:text-[var(--primary-600)] transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/productos" className="hover:text-[var(--primary-600)] transition-colors">Productos</Link>
            {typedProduct.category && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/productos?category=${encodeURIComponent(typedProduct.category)}`} className="hover:text-[var(--primary-600)] transition-colors">
                  {typedProduct.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--gray-900)] truncate max-w-[150px]">{typedProduct.name}</span>
          </nav>
        </Container>
      </div>

      {/* Main Product Section */}
      <Container className="py-4 lg:py-6">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 lg:gap-10">

          {/* Left - Product Viewer */}
          <div className="order-1">
            <div className="sticky top-4">
              <div className="h-[50vh] sm:h-[60vh] lg:h-[calc(100vh-120px)]">
                <ColorImageCarousel
                  images={typedProduct.variants.flatMap(v => v.images.map(img => ({
                    url: img.url,
                    type: v.attributes.color
                  }))) || typedProduct.media.images.map(img => ({ url: img.url }))}
                  alt={typedProduct.name}
                  initialColor={defaultVariant?.attributes.color}
                  arUrl={typedProduct.media.model3d?.glbUrl}
                  glbUrl={typedProduct.media.model3d?.glbUrl}
                  usdzUrl={typedProduct.media.model3d?.usdzUrl}
                />
              </div>
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="order-2">
            <div className="lg:max-w-md">
              {/* Store Badge */}
              {store && (
                <Link
                  href={`/catalog/${store.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-[var(--gray-500)] hover:text-[var(--primary-600)] transition-colors mb-3"
                >
                  <Store className="w-4 h-4" />
                  {store.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--gray-900)] leading-tight">
                {typedProduct.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(typedProduct.reviews.averageRating) ? 'fill-amber-400 text-amber-400' : 'fill-[var(--gray-200)] text-[var(--gray-200)]'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--gray-500)]">
                  {typedProduct.reviews.averageRating.toFixed(1)} ({typedProduct.reviews.totalReviews} reseñas)
                </span>
              </div>

              {/* Price Section */}
              <div className="mt-5 pb-5 border-b border-[var(--gray-100)]">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-[var(--gray-900)]">
                    {formatPrice(defaultVariant?.pricing.salePrice || 0)}
                  </span>
                  {typedProduct.pricing.hasDiscount && (
                    <span className="text-xl text-[var(--gray-400)] line-through">
                      {formatPrice(defaultVariant.pricing.listPrice)}
                    </span>
                  )}
                  {typedProduct.inventory.inStock ? (
                    <span className="text-sm text-[var(--success-600)] font-medium">
                      En stock
                    </span>
                  ) : (
                    <span className="text-sm text-[var(--error-500)] font-medium">
                      Agotado
                    </span>
                  )}
                </div>

                {/* AR Badge */}
                {hasAr && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary-50)] text-[var(--primary-700)] rounded-full text-sm font-medium">
                    <Box className="w-4 h-4" />
                    Modelo 3D disponible
                  </div>
                )}

                {/* Envío gratis */}
                {typedProduct.pricing.isFreeShipping && (
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--success-600)]">
                    <Truck className="w-4 h-4" />
                    Envío gratis a todo el país
                  </div>
                )}
              </div>

              {/* Short Description */}
              {typedProduct.description && (
                <p className="mt-4 text-[var(--gray-600)] text-sm leading-relaxed">
                  {typedProduct.description.length > 200
                    ? typedProduct.description.substring(0, 200) + "..."
                    : typedProduct.description}
                </p>
              )}

              {/* Selector de Variantes */}
              {typedProduct.variants.length > 1 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-[var(--gray-900)] mb-2">Variantes disponibles:</p>
                  <div className="flex flex-wrap gap-2">
                    {typedProduct.variants.map((variant) => (
                      <button
                        key={variant.id}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${variant.isDefault
                          ? 'border-[var(--primary-600)] bg-[var(--primary-50)] text-[var(--primary-700)]'
                          : 'border-[var(--gray-200)] hover:border-[var(--gray-300)]'
                          }`}
                      >
                        {variant.name}
                        <span className="ml-2 font-semibold">
                          {formatPrice(variant.pricing.salePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs mini */}
              <div className="mt-4 flex flex-wrap gap-2">
                {typedProduct.dimensions.widthCm > 0 && (
                  <span className="px-2.5 py-1 bg-[var(--gray-100)] text-[var(--gray-600)] text-xs rounded-md">
                    {typedProduct.dimensions.widthCm} × {typedProduct.dimensions.depthCm} cm
                  </span>
                )}
                {typedProduct.materials.primary && (
                  <span className="px-2.5 py-1 bg-[var(--gray-100)] text-[var(--gray-600)] text-xs rounded-md capitalize">
                    {typedProduct.materials.primary}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div id="product-main-actions" className="mt-6 space-y-3">
                <AddToCartButton
                  product={{
                    id: typedProduct.id,
                    slug: typedProduct.slug,
                    name: typedProduct.name,
                    price: defaultVariant?.pricing.salePrice || 0,
                    imageUrl: typedProduct.media.images[0]?.url || null,
                    storeName: store?.name || "Sin tienda",
                    storeSlug: store?.slug || "",
                    storeWhatsapp: store?.whatsapp || null,
                  }}
                  className="w-full !h-14 !rounded-xl !bg-[var(--primary-600)] !text-white !font-semibold !text-base hover:!bg-[var(--primary-700)] transition-colors"
                  disabled={!typedProduct.inventory.inStock}
                />

                {/* WhatsApp CTA */}
                {store?.whatsapp && store?.id && (
                  <WhatsappInquiryButton
                    productId={typedProduct.id}
                    storeId={store.id}
                    productName={typedProduct.name}
                    productPrice={defaultVariant?.pricing.salePrice || 0}
                    selectedVariant={defaultVariant}
                    storeWhatsapp={store.whatsapp}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--gray-200)] bg-white px-6 py-3.5 text-[var(--gray-700)] font-semibold transition-colors hover:border-[var(--success-600)] hover:text-[var(--success-600)]"
                  />
                )}
              </div>

              {/* Secondary Actions */}
              <div className="mt-4 flex items-center gap-3">
                <FavoriteButton
                  product={{
                    id: typedProduct.id,
                    slug: typedProduct.slug,
                    name: typedProduct.name,
                    price: defaultVariant?.pricing.salePrice || 0,
                    imageUrl: typedProduct.media.images[0]?.url,
                  }}
                  className="flex-1 !h-11 !rounded-xl border border-[var(--gray-200)] bg-white text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                />
                <ShareButton
                  productName={typedProduct.name}
                  className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-[var(--gray-200)] bg-white text-[var(--gray-700)] font-medium hover:bg-[var(--gray-50)] transition-colors"
                />
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-[var(--gray-100)] grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-[var(--gray-900)]">{typedProduct.warranty.durationMonths}</p>
                  <p className="text-xs text-[var(--gray-500)]">meses garantía</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--gray-900)]">
                    {typedProduct.logistics.deliveryTimeDays.min}-{typedProduct.logistics.deliveryTimeDays.max}
                  </p>
                  <p className="text-xs text-[var(--gray-500)]">días entrega</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--gray-900)]">
                    {typedProduct.logistics.assembly.included ? 'Sí' : 'No'}
                  </p>
                  <p className="text-xs text-[var(--gray-500)]">armado incluido</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Product Details Section */}
      <div className="bg-[var(--gray-50)] border-t border-[var(--gray-100)]">
        <Container className="py-10">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-[var(--gray-900)] mb-4">Descripción</h2>
              <div className="prose prose-sm max-w-none text-[var(--gray-600)]">
                {typedProduct.description ? (
                  <p className="leading-relaxed">{typedProduct.description}</p>
                ) : (
                  <p className="text-[var(--gray-400)] italic">Sin descripción disponible.</p>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h2 className="text-lg font-bold text-[var(--gray-900)] mb-4">Especificaciones</h2>
              <dl className="space-y-3">
                {typedProduct.category && (
                  <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                    <dt className="text-sm text-[var(--gray-500)]">Categoría</dt>
                    <dd className="text-sm font-medium text-[var(--gray-900)]">{typedProduct.category}</dd>
                  </div>
                )}
                {typedProduct.room && (
                  <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                    <dt className="text-sm text-[var(--gray-500)]">Ambiente</dt>
                    <dd className="text-sm font-medium text-[var(--gray-900)]">{typedProduct.room}</dd>
                  </div>
                )}
                {typedProduct.style && (
                  <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                    <dt className="text-sm text-[var(--gray-500)]">Estilo</dt>
                    <dd className="text-sm font-medium text-[var(--gray-900)]">{typedProduct.style}</dd>
                  </div>
                )}
                {typedProduct.materials.primary && (
                  <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                    <dt className="text-sm text-[var(--gray-500)]">Material</dt>
                    <dd className="text-sm font-medium text-[var(--gray-900)] capitalize">{typedProduct.materials.primary}</dd>
                  </div>
                )}
                {typedProduct.materials.finish && (
                  <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                    <dt className="text-sm text-[var(--gray-500)]">Acabado</dt>
                    <dd className="text-sm font-medium text-[var(--gray-900)] capitalize">{typedProduct.materials.finish}</dd>
                  </div>
                )}
                {typedProduct.dimensions.widthCm > 0 && (
                  <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                    <dt className="text-sm text-[var(--gray-500)]">Dimensiones</dt>
                    <dd className="text-sm font-medium text-[var(--gray-900)]">
                      {typedProduct.dimensions.widthCm} × {typedProduct.dimensions.depthCm} × {typedProduct.dimensions.heightCm} cm
                    </dd>
                  </div>
                )}
                {typedProduct.dimensions.weightKg > 0 && (
                  <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                    <dt className="text-sm text-[var(--gray-500)]">Peso</dt>
                    <dd className="text-sm font-medium text-[var(--gray-900)]">{typedProduct.dimensions.weightKg} kg</dd>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                  <dt className="text-sm text-[var(--gray-500)]">Garantía</dt>
                  <dd className="text-sm font-medium text-[var(--gray-900)]">
                    {typedProduct.warranty.durationMonths} meses ({typedProduct.warranty.type === 'factory' ? 'fábrica' : typedProduct.warranty.type})
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                  <dt className="text-sm text-[var(--gray-500)]">Entrega estimada</dt>
                  <dd className="text-sm font-medium text-[var(--gray-900)]">
                    {typedProduct.logistics.deliveryTimeDays.min}-{typedProduct.logistics.deliveryTimeDays.max} días hábiles
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </div>

      {/* Store Section */}
      {store && (
        <div className="bg-white border-t border-[var(--gray-100)]">
          <Container className="py-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-[var(--gray-100)] flex items-center justify-center shrink-0">
                <Store className="w-8 h-8 text-[var(--gray-400)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--gray-500)]">Vendido por</p>
                <h3 className="text-lg font-bold text-[var(--gray-900)]">{store.name}</h3>
                {store.address && (
                  <p className="text-sm text-[var(--gray-600)] mt-1">{store.address}, {store.city}</p>
                )}
                {store.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{store.rating}</span>
                  </div>
                )}
                <Link
                  href={`/catalog/${store.slug}`}
                  className="inline-flex items-center mt-3 text-sm font-medium text-[var(--primary-600)] hover:text-[var(--primary-700)]"
                >
                  Ver todos sus productos →
                </Link>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div className="bg-[var(--gray-50)] border-t border-[var(--gray-100)]">
          <Container className="py-10">
            <h2 className="text-xl font-bold text-[var(--gray-900)] mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p: ProductListItem) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Sticky Add to Cart - Mobile Only */}
      <StickyAddToCart
        product={{
          id: typedProduct.id,
          slug: typedProduct.slug,
          name: typedProduct.name,
          price: defaultVariant?.pricing.salePrice || 0,
          imageUrl: typedProduct.media.images[0]?.url,
          storeName: store?.name,
          storeSlug: store?.slug,
          storeWhatsapp: store?.whatsapp,
        }}
        arData={hasAr ? {
          arUrl: typedProduct.media.model3d?.glbUrl,
          glbUrl: typedProduct.media.model3d?.glbUrl,
          usdzUrl: typedProduct.media.model3d?.usdzUrl,
        } : undefined}
        disabled={!typedProduct.inventory.inStock}
      />
    </div>
  );
}
