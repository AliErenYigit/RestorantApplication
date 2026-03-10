import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/features/categories/api/categoryApi";
import { getProductsByCategorySlug } from "@/features/products/api/productApi";
import { CategoryTabs } from "@/features/categories/components/CategoryTabs";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductDetailModal } from "@/features/products/components/ProductDetailModal";
import type { Product } from "@/features/products/types/product";

export function MenuPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["public-categories"],
    queryFn: getCategories,
  });

  const sortedCategories = useMemo(() => {
    return [...categories].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }, [categories]);

  const resolvedActiveCategoryId = useMemo(() => {
    return activeCategoryId ?? sortedCategories[0]?.id ?? null;
  }, [activeCategoryId, sortedCategories]);

  const activeCategory = useMemo(() => {
    return (
      sortedCategories.find((c) => c.id === resolvedActiveCategoryId) ?? null
    );
  }, [sortedCategories, resolvedActiveCategoryId]);

  const {
    data: productsResponse = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["public-products", activeCategory?.slug],
    queryFn: () => getProductsByCategorySlug(activeCategory!.slug),
    enabled: !!activeCategory?.slug,
  });

  const products = useMemo(() => {
    return [...productsResponse].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
  }, [productsResponse]);

  if (categoriesLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#181c20] py-16 text-center text-slate-300 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
        Kategoriler yükleniyor...
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="rounded-[2rem] border border-rose-400/20 bg-[#181c20] py-16 text-center text-rose-300 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
        Kategoriler alınamadı.
      </div>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#181c20] py-16 text-center text-slate-400 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
        Kategori bulunamadı.
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-transparent text-slate-100">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#181c20] shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(249,115,22,0.12),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(234,179,8,0.08),transparent_20%),radial-gradient(circle_at_50%_85%,rgba(255,255,255,0.03),transparent_25%)]" />
            <div className="absolute left-[-50px] top-[30px] h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="absolute right-[10%] top-[12%] h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
          </div>

          <div className="relative mx-auto flex min-h-[220px] max-w-7xl flex-col items-center justify-center px-6 py-12 text-center md:min-h-[300px]">
            <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300 shadow-sm">
              CityIstanbul Menü
            </span>

            <div className="mt-6 inline-flex items-center gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-orange-400 md:text-6xl">
                City
              </span>

              <div className="relative flex h-14 w-14 items-center justify-center md:h-16 md:w-16">
                <div className="absolute bottom-1 h-0 w-0 border-l-[22px] border-r-[22px] border-t-[34px] border-l-transparent border-r-transparent border-t-[#2e8b57] md:border-l-[26px] md:border-r-[26px] md:border-t-[40px]" />
                <div className="absolute bottom-[9px] h-0 w-0 border-l-[18px] border-r-[18px] border-t-[27px] border-l-transparent border-r-transparent border-t-[#181c20] md:border-l-[21px] md:border-r-[21px] md:border-t-[31px]" />
                <span className="absolute left-[14px] top-[20px] h-2.5 w-2.5 rounded-full bg-red-500 md:left-[16px] md:top-[22px]" />
                <span className="absolute right-[14px] top-[24px] h-2.5 w-2.5 rounded-full bg-red-500 md:right-[16px] md:top-[27px]" />
                <span className="absolute top-[15px] h-2 w-2 rounded-full bg-[#f4c542] md:top-[17px]" />
              </div>

              <span className="text-4xl font-extrabold tracking-tight text-orange-400 md:text-6xl">
                Istanbul
              </span>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              Kategorilere göre menümüzü inceleyin ve ürün detaylarını keşfedin.
            </p>
          </div>

          <div className="h-1 w-full bg-orange-500" />
        </section>

        <div className="mx-auto mt-8 max-w-7xl space-y-8 px-4 md:px-6">
          <section className="rounded-[2rem] border border-white/10 bg-[#181c20] px-4 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)] md:px-6">
            <CategoryTabs
              categories={sortedCategories}
              activeCategoryId={resolvedActiveCategoryId}
              onSelectCategory={setActiveCategoryId}
            />
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#181c20] px-4 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.22)] md:px-6 md:py-8">
            <div className="mb-8">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Aktif Kategori
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
                {activeCategory?.name}
              </h2>

              {activeCategory?.description ? (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                  {activeCategory.description}
                </p>
              ) : null}
            </div>

            {productsLoading ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-[#23272d] py-12 text-center text-slate-300">
                Ürünler yükleniyor...
              </div>
            ) : productsError ? (
              <div className="rounded-[1.5rem] border border-rose-400/20 bg-[#23272d] py-12 text-center text-rose-300">
                Ürünler alınamadı.
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-[#23272d] py-12 text-center text-slate-400">
                Bu kategoriye ait ürün bulunamadı.
              </div>
            ) : (
              <ProductGrid
                products={products}
                onSelectProduct={setSelectedProduct}
              />
            )}
          </section>
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}