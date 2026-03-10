import type { Product } from "../types/product";
import { getImageUrl } from "@/shared/lib/getImageUrl";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-4">
        <div className="h-44 w-full shrink-0 overflow-hidden rounded bg-slate-100 sm:w-[200px]">
          {product.imageUrl ? (
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              Görsel Yok
            </div>
          )}
        </div>

        <div className="flex min-h-[176px] flex-1 flex-col justify-between pt-1">
          <div className="space-y-5">
            <div>
              <h3 className="text-[26px] font-bold leading-tight text-slate-700">
                {product.name}
              </h3>

              {product.description ? (
                <p className="mt-2 text-[18px] leading-7 text-slate-500">
                  {product.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="pt-6">
            <span className="text-[22px] font-extrabold tracking-tight text-[#a52a00]">
              {Number(product.price).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              ₺
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}