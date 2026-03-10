import type { Product } from "../types/product";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
};

export function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onSelectProduct}
        />
      ))}
    </div>
  );
}