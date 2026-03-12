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

  const activeCategories = useMemo(() => {
    return categories.filter((category) => category.isActive !== false);
  }, [categories]);

  const sortedCategories = useMemo(() => {
    return [...activeCategories].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
  }, [activeCategories]);

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
      <div className="rounded-[2rem] border border-cyan-100 bg-[#f6ffff] py-16 text-center text-slate-600 shadow-[0_16px_40px_rgba(20,184,166,0.06)]">
        Kategoriler yükleniyor...
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-[#f6ffff] py-16 text-center text-rose-600 shadow-[0_16px_40px_rgba(20,184,166,0.06)]">
        Kategoriler alınamadı.
      </div>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <div className="rounded-[2rem] border border-cyan-100 bg-[#f6ffff] py-16 text-center text-slate-500 shadow-[0_16px_40px_rgba(20,184,166,0.06)]">
        Aktif kategori bulunamadı.
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-transparent text-slate-800">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d7f0ef] bg-[linear-gradient(180deg,#f8ffff_0%,#eefdfc_55%,#e9fbff_100%)] shadow-[0_20px_50px_rgba(20,184,166,0.08)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(20,184,166,0.12),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(6,182,212,0.10),transparent_20%),radial-gradient(circle_at_50%_85%,rgba(255,255,255,0.55),transparent_25%)]" />
            <div className="absolute left-[-50px] top-[30px] h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
            <div className="absolute right-[10%] top-[12%] h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          </div>

          <div className="relative mx-auto flex min-h-[220px] max-w-7xl flex-col items-center justify-center px-6 py-12 text-center md:min-h-[300px]">
            <span className="inline-flex rounded-full border border-teal-200 bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700 shadow-sm">
              CityIstanbul Menü
            </span>

            <div className="mt-6 inline-flex items-center gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-[#14b8a6] md:text-6xl">
                City
              </span>

              <div className="relative flex h-14 w-14 items-center justify-center md:h-16 md:w-16">
                <div className="absolute bottom-1 h-0 w-0 border-l-[22px] border-r-[22px] border-t-[34px] border-l-transparent border-r-transparent border-t-[#14b8a6] md:border-l-[26px] md:border-r-[26px] md:border-t-[40px]" />
                <div className="absolute bottom-[9px] h-0 w-0 border-l-[18px] border-r-[18px] border-t-[27px] border-l-transparent border-r-transparent border-t-[#f8ffff] md:border-l-[21px] md:border-r-[21px] md:border-t-[31px]" />
                <span className="absolute left-[14px] top-[20px] h-2.5 w-2.5 rounded-full bg-rose-400 md:left-[16px] md:top-[22px]" />
                <span className="absolute right-[14px] top-[24px] h-2.5 w-2.5 rounded-full bg-rose-400 md:right-[16px] md:top-[27px]" />
                <span className="absolute top-[15px] h-2 w-2 rounded-full bg-amber-300 md:top-[17px]" />
              </div>

              <span className="text-4xl font-extrabold tracking-tight text-[#06b6d4] md:text-6xl">
                Istanbul
              </span>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Kategorilere göre menümüzü inceleyin ve ürün detaylarını keşfedin.
            </p>
          </div>

          <div className="h-1 w-full bg-gradient-to-r from-[#14b8a6] to-[#06b6d4]" />
        </section>

        <div className="mx-auto mt-8 max-w-7xl space-y-8 px-4 md:px-6">
          <section className="rounded-[2rem] border border-[#d7f0ef] bg-[#f5ffff] px-4 py-5 shadow-[0_16px_40px_rgba(20,184,166,0.06)] md:px-6">
            <CategoryTabs
              categories={sortedCategories}
              activeCategoryId={resolvedActiveCategoryId}
              onSelectCategory={setActiveCategoryId}
            />
          </section>

          <section className="rounded-[2rem] border border-[#d7f0ef] bg-[#f8ffff] px-4 py-6 shadow-[0_16px_40px_rgba(20,184,166,0.06)] md:px-6 md:py-8">
            <div className="mb-8">
              <span className="inline-flex rounded-full border border-teal-100 bg-white px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                Aktif Kategori
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                {activeCategory?.name}
              </h2>

            </div>

            {productsLoading ? (
              <div className="rounded-[1.5rem] border border-cyan-100 bg-white py-12 text-center text-slate-600">
                Ürünler yükleniyor...
              </div>
            ) : productsError ? (
              <div className="rounded-[1.5rem] border border-rose-200 bg-white py-12 text-center text-rose-600">
                Ürünler alınamadı.
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-[1.5rem] border border-cyan-100 bg-white py-12 text-center text-slate-500">
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