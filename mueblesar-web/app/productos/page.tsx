export const revalidate = 60;

import { Container } from "../components/layout/Container";
import { fetchProducts } from "../lib/api";
import { ProductsClient } from "./ProductsClient";

async function getProducts(filters: { arOnly?: boolean; sort?: "price_asc" | "price_desc" }) {
  try {
    const data = await fetchProducts(filters);
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ arOnly?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const arOnly = params.arOnly === "true";
  const sort = params.sort === "price_asc" || params.sort === "price_desc" ? params.sort : undefined;
  const products = await getProducts({ arOnly, sort });

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8">
      <Container>
        <ProductsClient initialProducts={products} initialArOnly={arOnly} initialSort={sort} />
      </Container>
    </div>
  );
}
