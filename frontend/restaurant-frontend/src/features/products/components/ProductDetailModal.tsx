import { useEffect } from "react";
import type { Product } from "../types/product";

type ProductDetailModalProps = {
  product: Product | null;
  onClose: () => void;
};

export function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  useEffect(() => {
    if (!product) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 md:items-center md:p-6">
      <div className="max-h-[95vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-2xl md:rounded-3xl">
        <div className="relative h-64 w-full bg-slate-100 md:h-80">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              Görsel Yok
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow"
          >
            Kapat
          </button>
        </div>

        <div className="max-h-[calc(95vh-16rem)] overflow-y-auto p-5 md:max-h-[calc(95vh-20rem)] md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Ürün detay bilgileri
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 px-4 py-2 text-lg font-bold text-white">
              ₺{Number(product.price).toFixed(2)}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Açıklama
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {product.description || "Bu ürün için açıklama eklenmemiş."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 -z-10 cursor-default"
        aria-label="Modal arka planı"
      />
    </div>
  );
}