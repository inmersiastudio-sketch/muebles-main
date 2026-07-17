export const revalidate = 60;

import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Store, ChevronRight, Box, Truck } from "lucide-react";
import { Container } from "@/app/components/layout/Container";
import { ColorImageCarousel } from "@/app/components/media/ColorImageCarousel";
import { FavoriteButton } from "@/app/components/favorites/FavoriteButton";
import { fetchProductBySlug, fetchProducts } from "@/app/lib/api";
import { PDPViewTracker } from "@/app/components/products/PDPViewTracker";
import { ProductCard } from "@/app/components/products/ProductCard";
import { StickyAddToCart } from "@/app/components/products/StickyAddToCart";
import { ShareButton } from "@/app/components/products/ShareButton";
import { WhatsappInquiryButton } from "@/app/components/inquiry/WhatsappInquiryButton";
import { PackageARPreview } from "@/app/components/products/PackageARPreview";
import { ARPreview } from "@/app/components/products/ARPreview";
import type { Product, ProductListItem } from "@/types";
import type { Metadata } from "next";

function formatPrice(value: number): string {
  return `$${(value ?? 0).toLocaleString("es-AR")}`;
}

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  const p = product as Product;
  const image = p.media?.images?.[0]?.url;
  return {
    title: p.name,
    description: p.description || `${p.name} en Amobly`,
    openGraph: {
      title: p.name,
      description: p.description || `${p.name} en Amobly`,
      images: image ? [{ url: image, width: 800, height: 600, alt: p.name }] : [],
    },
  };
}

export default async function ProductDetail({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) return notFound();

  // El producto ya viene transformado del API
  const typedProduct = product as Product;

  const store = typedProduct.store;
  const hasAr = typedProduct.media.model3d?.glbUrl || typedProduct.media.model3d?.usdzUrl;
  const isArVerified = typedProduct.dimensions.arVerified === true;
  const packageDimensions = typedProduct.dimensions.packageDimensions;
  const hasPackageDimensions = Boolean(
    packageDimensions?.widthCm && packageDimensions?.heightCm && packageDimensions?.depthCm
  );
  const deliveryTime = typedProduct.logistics?.deliveryTimeDays;
  const hasDeliveryEstimate = Boolean(
    (deliveryTime?.min ?? 0) > 0 || (deliveryTime?.max ?? 0) > 0
  );
  const includesAssembly = typedProduct.logistics?.assembly?.included === true;

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: typedProduct.name,
    description: typedProduct.description,
    image: typedProduct.media.images?.[0]?.url || "",
    brand: {
      "@type": "Brand",
      name: store?.name || "Amobly",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: defaultVariant?.pricing.salePrice || 0,
    },
    ...(typedProduct.reviews.averageRating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: typedProduct.reviews.averageRating,
        reviewCount: typedProduct.reviews.totalReviews,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
                  images={
                    typedProduct.variants.some(v => v.images.length > 0)
                      ? typedProduct.variants.flatMap(v => v.images.map(img => ({
                          url: img.url,
                          type: v.attributes.color
                        })))
                      : typedProduct.media.images.map(img => ({ url: img.url }))
                  }
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
                  <span className="text-sm text-[var(--gray-500)] font-medium">
                    Disponibilidad a confirmar con la tienda
                  </span>
                </div>

                {/* AR Badge */}
                {hasAr && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary-50)] text-[var(--primary-700)] rounded-full text-sm font-medium">
                    <Box className="w-4 h-4" />
                    Modelo 3D disponible
                  </div>
                )}

              </div>

              {/* Shipping Banner */}
              <div className="mt-4 p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3">
                <Truck className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {typedProduct.pricing.isFreeShipping ? "Envío gratis" : "Envío a coordinar"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {typedProduct.pricing.isFreeShipping
                      ? "Esta mueblería ofrece envío gratuito para este producto."
                      : "El costo, la modalidad y la fecha de entrega se acuerdan directamente con la mueblería al realizar la consulta."}
                  </p>
                </div>
              </div>

              {hasPackageDimensions && packageDimensions && (
                <div className="mt-4">
                  <PackageARPreview
                    productId={typedProduct.id}
                    storeId={store?.id}
                    productName={typedProduct.name}
                    widthCm={packageDimensions.widthCm}
                    heightCm={packageDimensions.heightCm}
                    depthCm={packageDimensions.depthCm}
                    weightKg={packageDimensions.weightKg}
                    piecesCount={typedProduct.logistics.packaging?.piecesCount}
                  />
                </div>
              )}

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
                {/* AR Button */}
                {hasAr && (
                  <ARPreview
                    glbUrl={typedProduct.media.model3d?.glbUrl}
                    usdzUrl={typedProduct.media.model3d?.usdzUrl}
                    productId={typedProduct.id}
                    storeId={store?.id}
                    productName={typedProduct.name}
                    widthCm={typedProduct.dimensions.widthCm}
                    depthCm={typedProduct.dimensions.depthCm}
                    heightCm={typedProduct.dimensions.heightCm}
                    isVerified={isArVerified}
                  />
                )}

                {/* WhatsApp CTA - Primary */}
                {store?.id && (
                  <WhatsappInquiryButton
                    productId={typedProduct.id}
                    storeId={store.id}
                    productName={typedProduct.name}
                    productPrice={defaultVariant?.pricing.salePrice || 0}
                    selectedVariant={defaultVariant}
                    storeWhatsapp={store.whatsapp}
                    imageUrl={typedProduct.media.images?.[0]?.url || null}
                    glbUrl={typedProduct.media.model3d?.glbUrl || null}
                    usdzUrl={typedProduct.media.model3d?.usdzUrl || null}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 text-base font-bold shadow-md transition-transform active:scale-[0.98] cursor-pointer"
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
                  <p className="text-lg font-semibold text-[var(--gray-900)]">{typedProduct.warranty.durationMonths > 0 ? typedProduct.warranty.durationMonths : "A confirmar"}</p>
                  <p className="text-xs text-[var(--gray-500)]">garantía</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--gray-900)]">
                    {hasDeliveryEstimate
                      ? `${deliveryTime?.min}-${deliveryTime?.max}`
                      : "A confirmar"}
                  </p>
                  <p className="text-xs text-[var(--gray-500)]">entrega</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--gray-900)]">
                    {includesAssembly ? 'Sí' : 'A confirmar'}
                  </p>
                  <p className="text-xs text-[var(--gray-500)]">armado</p>
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
                    {typedProduct.warranty.durationMonths > 0
                      ? `${typedProduct.warranty.durationMonths} meses (${typedProduct.warranty.type === 'factory' ? 'fábrica' : typedProduct.warranty.type})`
                      : 'A confirmar con la tienda'}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--gray-200)]">
                  <dt className="text-sm text-[var(--gray-500)]">Entrega estimada</dt>
                  <dd className="text-sm font-medium text-[var(--gray-900)]">
                    {hasDeliveryEstimate
                      ? `${deliveryTime?.min}-${deliveryTime?.max} días hábiles`
                      : 'A confirmar con la tienda'}
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
          storeId: store?.id,
        }}
        arData={hasAr ? {
          arUrl: typedProduct.media.model3d?.glbUrl,
          glbUrl: typedProduct.media.model3d?.glbUrl,
          usdzUrl: typedProduct.media.model3d?.usdzUrl,
          isVerified: isArVerified,
        } : undefined}
        disabled={false}
      />
    </div>
  );
}
