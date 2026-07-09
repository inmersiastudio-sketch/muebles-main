import type { Metadata } from "next";
import Link from "next/link";
import { Store, ArrowLeft, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { fetchCatalogProduct } from "@/app/lib/api";
import { Container } from "@/app/components/layout/Container";
import { ColorImageCarousel } from "@/app/components/media/ColorImageCarousel";
import { ARPreview } from "@/app/components/products/ARPreview";
import { ProductInfoTabs } from "@/app/components/products/ProductInfoTabs";
import { StickyAddToCart } from "@/app/components/products/StickyAddToCart";
import { Button } from "@/app/components/ui/Button";

interface Props {
    params: Promise<{ slug: string; productSlug: string }>;
}

function formatPrice(value: number): string {
    return `$${(value ?? 0).toLocaleString("es-AR")}`;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, productSlug } = await params;
    const response = await fetchCatalogProduct(slug, productSlug);

    if (!response) {
        return {
            title: "Producto no encontrado | Amobly",
        };
    }

    const { store, product } = response;

    return {
        title: `${product.name} | ${store.name}`,
        description: product.description || `Ver ${product.name} en Realidad Aumentada`,
        openGraph: {
            title: `${product.name} | ${store.name}`,
            description: product.description || `Ver ${product.name} en Realidad Aumentada`,
            type: "website",
            images: product.images?.[0]?.url ? [product.images[0].url] : [],
        },
    };
}

export default async function CatalogProductPage({ params }: Props) {
    const { slug, productSlug } = await params;
    const product = await fetchCatalogProduct(slug, productSlug);

    if (!product) {
        notFound();
    }

    const { store, product: productData, relatedProducts } = product;

    const images = productData.images?.map(img => img.url) || 
                   (productData.imageUrl ? [productData.imageUrl] : []);

    const arModelUrl = productData.glbUrl || productData.arUrl;
    const usdzUrl = productData.usdzUrl;

    const message = encodeURIComponent(
        `Hola! Me interesa el ${productData.name} que vi en su catálogo de Amobly. Precio: ${formatPrice(productData.price)}. Está disponible?`
    );
    const waLink = store.whatsapp
        ? `https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${message}`
        : undefined;

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Bar */}
            <div className="border-b border-slate-200 bg-white">
                <Container>
                    <div className="flex h-14 items-center gap-4">
                        <Link 
                            href={`/catalog/${slug}`} 
                            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span>Volver a {store.name}</span>
                        </Link>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="py-8 md:py-12">
                    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                        <ColorImageCarousel
                            images={productData.images?.length ? productData.images : images.map((u: string) => ({ url: u }))}
                            alt={productData.name}
                            arUrl={productData.arUrl ?? undefined}
                            glbUrl={productData.glbUrl ?? undefined}
                            usdzUrl={productData.usdzUrl ?? undefined}
                        />

                        <div className="space-y-6">
                            {/* Product Header */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">
                                        {productData.category}
                                    </p>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                                        {productData.name}
                                    </h1>
                                </div>

                                <div className="text-3xl font-bold text-slate-900">
                                    {formatPrice(productData.price)}
                                </div>

                                {/* AR Badge */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {arModelUrl && (
                                        <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="12"
                                                height="12"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2-1m2 1l-2 1m2-1v10l-2 1m-10-11l2-1m-2 1l2 1m-2-1v10l2 1m10-11l-2-1m-6-3l-2 1m2-1l2 1"
                                                />
                                            </svg>
                                            AR disponible
                                            {productData.widthCm && (
                                                <span className="text-slate-400">· Escala real</span>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Product Details Tabs */}
                            <ProductInfoTabs
                                description={productData.description ?? undefined}
                                category={productData.category ?? undefined}
                                widthCm={productData.widthCm ?? undefined}
                                depthCm={productData.depthCm ?? undefined}
                                heightCm={productData.heightCm ?? undefined}
                            />

                            {/* CTA Buttons */}
                            <div id="product-main-actions" className="space-y-3 pt-4 border-t border-slate-200">
                                {/* WhatsApp Contact */}
                                {waLink ? (
                                    <a 
                                        href={waLink} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        <MessageCircle size={18} />
                                        Consultar por WhatsApp
                                    </a>
                                ) : (
                                    <Button variant="secondary" size="lg" disabled className="w-full">
                                        WhatsApp no disponible
                                    </Button>
                                )}

                                {/* AR Button */}
                                {arModelUrl || productData.glbUrl ? (
                                    <ARPreview
                                        arUrl={arModelUrl ?? undefined}
                                        glbUrl={productData.glbUrl ?? undefined}
                                        usdzUrl={usdzUrl ?? undefined}
                                        productId={productData.id}
                                        productName={productData.name}
                                        widthCm={productData.widthCm ?? undefined}
                                        depthCm={productData.depthCm ?? undefined}
                                        heightCm={productData.heightCm ?? undefined}
                                    />
                                ) : (
                                    <Button variant="outline" size="lg" disabled className="w-full">
                                        AR no disponible
                                    </Button>
                                )}
                            </div>

                            {/* Store Info Card */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                    <Store className="w-6 h-6 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Vendido por
                                    </p>
                                    <p className="text-base font-semibold text-slate-900">
                                        {store.name}
                                    </p>
                                    {store.address && (
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            {store.address}
                                        </p>
                                    )}
                                    <Link
                                        href={`/catalog/${slug}`}
                                        className="inline-flex items-center mt-3 text-sm font-medium text-slate-900 hover:text-slate-700"
                                    >
                                        Ver todos sus productos →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-slate-50">
                <Container>
                    <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
                        </p>
                        <p className="text-sm text-slate-400">
                            Catálogo digital por{" "}
                            <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium">
                                Amobly
                            </Link>
                        </p>
                    </div>
                </Container>
            </footer>

            {/* Sticky Add to Cart - Mobile Only */}
            <StickyAddToCart
                product={{
                    id: productData.id,
                    slug: productData.slug,
                    name: productData.name,
                    price: productData.price,
                    imageUrl: images[0],
                    storeName: store.name,
                    storeSlug: slug,
                    storeWhatsapp: store.whatsapp,
                }}
                arData={arModelUrl ? {
                    arUrl: productData.arUrl ?? undefined,
                    glbUrl: productData.glbUrl ?? undefined,
                    usdzUrl: productData.usdzUrl ?? undefined,
                    widthCm: productData.widthCm ?? undefined,
                    depthCm: productData.depthCm ?? undefined,
                    heightCm: productData.heightCm ?? undefined,
                } : undefined}
                disabled={!productData.inStock}
            />
        </div>
    );
}
