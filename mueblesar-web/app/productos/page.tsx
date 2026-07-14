export const revalidate = 60;

import { Container } from "../components/layout/Container";
import { fetchProducts } from "../lib/api";
import { ProductsClient } from "./ProductsClient";

async function getProducts() {
  try {
    const data = await fetchProducts();
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8">
      <Container>
        <ProductsClient initialProducts={products as any[]} />
      </Container>
    </div>
  );
}
