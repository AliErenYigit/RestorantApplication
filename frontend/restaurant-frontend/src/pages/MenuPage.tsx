import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/features/categories/api/categoryApi";
import { getProductsByCategorySlug } from "@/features/products/api/productApi";
import { CategoryTabs } from "@/features/categories/components/CategoryTabs";
import { ProductGrid } from "@/features/products/components/ProductGrid";

export function MenuPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

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
      <div className="py-10 text-center text-slate-600">
        Kategoriler yükleniyor...
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="py-10 text-center text-red-600">
        Kategoriler alınamadı.
      </div>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <div className="py-10 text-center text-slate-600">
        Kategori bulunamadı.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f7f1ef_0%,#f6efed_35%,#f2ecea_100%)] shadow-sm">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[8%] top-[12%] h-28 w-28 rounded-full bg-white blur-3xl" />
          <div className="absolute left-[35%] top-[8%] h-24 w-24 rounded-full bg-white blur-3xl" />
          <div className="absolute right-[18%] top-[18%] h-24 w-24 rounded-full bg-[#fff7d6] blur-3xl" />
          <div className="absolute bottom-[-20px] left-[20%] h-20 w-20 rounded-xl bg-[#e8d6cf] blur-2xl" />
          <div className="absolute bottom-[10px] left-[38%] h-20 w-20 rounded-xl bg-[#e7d4cf] blur-2xl" />
          <div className="absolute bottom-[0px] right-[22%] h-24 w-24 rounded-xl bg-[#efe2dd] blur-2xl" />
        </div>

        <div className="relative mx-auto flex min-h-[220px] max-w-7xl items-center justify-center px-6 py-10 md:min-h-[300px]">
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-[#e67e22] md:text-6xl">
                City
              </span>

              <div className="relative flex h-14 w-14 items-center justify-center md:h-16 md:w-16">
                <div className="absolute bottom-1 h-0 w-0 border-l-[22px] border-r-[22px] border-t-[34px] border-l-transparent border-r-transparent border-t-[#2e8b57] md:border-l-[26px] md:border-r-[26px] md:border-t-[40px]" />
                <div className="absolute bottom-[9px] h-0 w-0 border-l-[18px] border-r-[18px] border-t-[27px] border-l-transparent border-r-transparent border-t-[#f7f1ef] md:border-l-[21px] md:border-r-[21px] md:border-t-[31px]" />
                <span className="absolute left-[14px] top-[20px] h-2.5 w-2.5 rounded-full bg-red-500 md:left-[16px] md:top-[22px]" />
                <span className="absolute right-[14px] top-[24px] h-2.5 w-2.5 rounded-full bg-red-500 md:right-[16px] md:top-[27px]" />
                <span className="absolute top-[15px] h-2 w-2 rounded-full bg-[#f4c542] md:top-[17px]" />
              </div>

              <span className="text-4xl font-extrabold tracking-tight text-[#e67e22] md:text-6xl">
                Istanbul
              </span>
            </div>
          </div>
        </div>

        <div className="h-1 w-full bg-red-600" />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <section className="mb-8 flex justify-center">
          <CategoryTabs
            categories={sortedCategories}
            activeCategoryId={resolvedActiveCategoryId}
            onSelectCategory={setActiveCategoryId}
          />
        </section>

        <section className="mx-auto max-w-7xl space-y-6">
          {productsLoading ? (
            <div className="py-10 text-center text-slate-600">
              Ürünler yükleniyor...
            </div>
          ) : productsError ? (
            <div className="py-10 text-center text-red-600">
              Ürünler alınamadı.
            </div>
          ) : products.length === 0 ? (
            <div className="py-10 text-center text-slate-600">
              Bu kategoriye ait ürün bulunamadı.
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </section>
      </div>
    </div>
  );
}