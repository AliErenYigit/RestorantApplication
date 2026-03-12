import type { Product } from "../types/product";
import { getImageUrl } from "@/shared/lib/getImageUrl";

type ProductCardProps = {
  product: Product;
  onClick?: (product: Product) => void;
};

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <article
      onClick={() => onClick?.(product)}
      className="cursor-pointer overflow-hidden rounded-[1.75rem] border border-cyan-100 bg-white shadow-[0_10px_30px_rgba(6,182,212,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(20,184,166,0.14)] active:scale-[0.99]"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
        <div className="h-44 w-full shrink-0 overflow-hidden rounded-[1.25rem] bg-slate-100 sm:w-[200px]">
          {product.imageUrl ? (
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              Görsel Yok
            </div>
          )}
        </div>

        <div className="flex min-h-[176px] flex-1 flex-col justify-between pt-1">
          <div className="space-y-4">
            <div>
              <h3 className="text-[24px] font-bold leading-tight text-slate-900">
                {product.name}
              </h3>

              {product.description ? (
                <p className="mt-3 text-[16px] leading-7 text-slate-600">
                  {product.description}
                </p>
              ) : (
                <p className="mt-3 text-[15px] leading-7 text-slate-400">
                  Detaylı açıklama bulunmuyor.
                </p>
              )}
            </div>
          </div>

          <div className="pt-6">
            <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-[18px] font-extrabold tracking-tight text-teal-700">
              ₺
              {Number(product.price).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}