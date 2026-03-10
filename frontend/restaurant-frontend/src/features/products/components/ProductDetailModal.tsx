import { useEffect, useState } from "react";
import type { Product } from "../types/product";
import { getImageUrl } from "@/shared/lib/getImageUrl";

type ProductDetailModalProps = {
  product: Product | null;
  onClose: () => void;
};

export function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!product) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 10);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      window.clearTimeout(timer);
      setVisible(false);
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 md:items-center md:p-6">
      <button
        type="button"
        onClick={onClose}
        className={[
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-label="Modal arka planı"
      />

      <div
        className={[
          "relative max-h-[95vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl transition-all duration-300 md:max-w-2xl md:rounded-3xl",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-95 opacity-0",
        ].join(" ")}
      >
        <div className="relative h-64 w-full bg-slate-100 md:h-80">
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

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow transition hover:bg-white"
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
            
            </div>

            <div className="rounded-2xl bg-slate-900 px-4 py-2 text-lg font-bold text-white">
              ₺
              {Number(product.price).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
            
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {product.description || "Bu ürün için açıklama eklenmemiş."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}