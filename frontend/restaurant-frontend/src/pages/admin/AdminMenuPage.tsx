import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "../../features/categories/api/categoryApi";
import {
  createProduct,
  getProductsByCategorySlug,
} from "../../features/products/api/productApi";
import { uploadProductImage } from "../../features/uploads/api/uploadApi";
import type { CreateProductRequest } from "../../features/products/types/createProductRequest";
import { getImageUrl } from "@/shared/lib/getImageUrl";
import { useAdminSession } from "../../features/admin/context/AdminSessionContext";
import axios from "axios";

export function AdminMenuPage() {
  const queryClient = useQueryClient();
  const { adminKey } = useAdminSession();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [lastUploadDuplicated, setLastUploadDuplicated] = useState<boolean | null>(null);
  const [lastUploadedSha256, setLastUploadedSha256] = useState<string>("");

  const [form, setForm] = useState<Omit<CreateProductRequest, "categoryId">>({
    name: "",
    price: 0,
    description: "",
    imageUrl: "",
    sortOrder: 1,
    isActive: true,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
  });

  const sortedCategories = useMemo(() => {
    return [...categories].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }, [categories]);

  const effectiveCategoryId = useMemo(() => {
    if (
      selectedCategoryId !== null &&
      sortedCategories.some((c) => c.id === selectedCategoryId)
    ) {
      return selectedCategoryId;
    }

    return sortedCategories[0]?.id ?? null;
  }, [selectedCategoryId, sortedCategories]);

  const selectedCategory = useMemo(() => {
    return sortedCategories.find((c) => c.id === effectiveCategoryId) ?? null;
  }, [sortedCategories, effectiveCategoryId]);

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["admin-products-preview", selectedCategory?.slug, adminKey],
    queryFn: () => getProductsByCategorySlug(selectedCategory!.slug),
    enabled: !!selectedCategory?.slug && !!adminKey.trim(),
  });

  const sortedProducts = useMemo(() => {
    return [...products].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
  }, [products]);

  const uploadImageMutation = useMutation({
    mutationFn: async () => {
      if (!adminKey.trim()) {
        throw new Error("Lütfen önce X-Admin-Key girin.");
      }

      if (!selectedImageFile) {
        throw new Error("Lütfen bir görsel seçin.");
      }

      return uploadProductImage(adminKey, selectedImageFile);
    },
    onSuccess: (data) => {
      if (!data.imageUrl) {
        setStatusMessage("Upload başarılı görünüyor ama imageUrl dönmedi.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        imageUrl: data.imageUrl,
      }));

      setLastUploadDuplicated(data.duplicated);
      setLastUploadedSha256(data.sha256);

      setStatusMessage(
        data.duplicated
          ? "Aynı görsel daha önce yüklenmiş. Mevcut görsel URL'i kullanıldı."
          : "Görsel başarıyla yüklendi."
      );
    },
    onError: (error) => {
      setLastUploadDuplicated(null);
      setLastUploadedSha256("");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Görsel yüklenirken hata oluştu."
      );
    },
  });

  const createProductMutation = useMutation({
    mutationFn: () =>
      createProduct(adminKey, {
        categoryId: effectiveCategoryId!,
        ...form,
      }),
    onSuccess: async () => {
      setStatusMessage("Ürün başarıyla oluşturuldu.");

      setForm({
        name: "",
        price: 0,
        description: "",
        imageUrl: "",
        sortOrder: 1,
        isActive: true,
      });

      setSelectedImageFile(null);
      setLastUploadDuplicated(null);
      setLastUploadedSha256("");

      if (selectedCategory?.slug) {
        await queryClient.invalidateQueries({
          queryKey: ["admin-products-preview", selectedCategory.slug],
        });
        await queryClient.invalidateQueries({
          queryKey: ["public-products", selectedCategory.slug],
        });
      }
    },
    onError: (error: unknown) => {
      setLastUploadDuplicated(null);
      setLastUploadedSha256("");

      let apiMessage = "Ürün oluşturulurken hata oluştu.";

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; error?: string; detail?: string }
          | undefined;

        apiMessage =
          responseData?.message ||
          responseData?.error ||
          responseData?.detail ||
          error.message ||
          "Ürün oluşturulurken hata oluştu.";
      } else if (error instanceof Error) {
        apiMessage = error.message;
      }

      setStatusMessage(apiMessage);
    },
  });

  const handleChange = <K extends keyof Omit<CreateProductRequest, "categoryId">>(
    field: K,
    value: Omit<CreateProductRequest, "categoryId">[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage("");

    if (!adminKey.trim()) {
      setStatusMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    if (!effectiveCategoryId) {
      setStatusMessage("Lütfen kategori seçin.");
      return;
    }

    if (!form.name.trim()) {
      setStatusMessage("Ürün adı zorunludur.");
      return;
    }

    if (Number(form.price) <= 0) {
      setStatusMessage("Fiyat 0'dan büyük olmalıdır.");
      return;
    }

    if (!form.imageUrl?.trim()) {
      setStatusMessage("Lütfen önce ürün görseli yükleyin.");
      return;
    }

    createProductMutation.mutate();
  };

  const isSuccessMessage =
    statusMessage.toLowerCase().includes("başarı") ||
    statusMessage.toLowerCase().includes("oluşturuldu") ||
    statusMessage.toLowerCase().includes("yüklendi") ||
    statusMessage.toLowerCase().includes("kullanıldı");

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Menü Yönetimi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ürün ekleyin, görsel yükleyin ve seçili kategoriye ait ürünleri yönetin.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Ürün Ekle</h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kategori
              </label>

              {categoriesLoading ? (
                <div className="text-sm text-slate-500">Kategoriler yükleniyor...</div>
              ) : categoriesError ? (
                <div className="text-sm text-red-500">Kategoriler alınamadı.</div>
              ) : (
                <select
                  value={effectiveCategoryId ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCategoryId(value ? Number(value) : null);
                  }}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option value="">Kategori seçin</option>
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ürün Adı
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Örn: Ton Balıklı Salata"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Fiyat
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange("price", Number(e.target.value))}
                placeholder="500"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Açıklama
              </label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Ürün açıklaması"
                rows={4}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700">
                Ürün Görseli
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSelectedImageFile(file);
                  setStatusMessage("");
                  setLastUploadDuplicated(null);
                  setLastUploadedSha256("");

                  if (!file) {
                    setForm((prev) => ({
                      ...prev,
                      imageUrl: "",
                    }));
                  }
                }}
                className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
              />

              {selectedImageFile ? (
                <div className="text-xs text-slate-600">
                  Seçilen dosya: <span className="font-medium">{selectedImageFile.name}</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Henüz görsel seçilmedi.</div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!selectedImageFile) {
                    setStatusMessage("Lütfen önce bir görsel seçin.");
                    return;
                  }

                  if (!adminKey.trim()) {
                    setStatusMessage("Lütfen önce X-Admin-Key girin.");
                    return;
                  }

                  setStatusMessage("");
                  uploadImageMutation.mutate();
                }}
                disabled={uploadImageMutation.isPending}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white transition ${
                  uploadImageMutation.isPending
                    ? "cursor-not-allowed bg-slate-400"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {uploadImageMutation.isPending ? "Yükleniyor..." : "Görseli Yükle"}
              </button>

              {form.imageUrl ? (
                <div className="space-y-2">
                  <p className="text-xs text-green-700">
                    {lastUploadDuplicated
                      ? "Aynı görsel bulundu, mevcut dosya kullanıldı."
                      : "Görsel başarıyla yüklendi."}
                  </p>

                  {lastUploadedSha256 ? (
                    <p className="break-all text-[11px] text-slate-500">
                      SHA256: {lastUploadedSha256}
                    </p>
                  ) : null}

                  <p className="break-all text-[11px] text-slate-500">
                    URL: {form.imageUrl}
                  </p>

                  <img
                    src={getImageUrl(form.imageUrl)}
                    alt="Yüklenen görsel"
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sıralama
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => handleChange("sortOrder", Number(e.target.value))}
                placeholder="1"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Aktif ürün
              </label>
            </div>

            {statusMessage ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  isSuccessMessage
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {statusMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={createProductMutation.isPending}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createProductMutation.isPending ? "Kaydediliyor..." : "Ürünü Oluştur"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Kategoriye Ait Ürünler
          </h2>

          {selectedCategory ? (
            <p className="mt-1 text-sm text-slate-500">
              Seçili kategori:{" "}
              <span className="font-medium text-slate-700">{selectedCategory.name}</span>
            </p>
          ) : null}

          {!adminKey.trim() ? (
            <p className="mt-4 text-sm text-slate-500">
              Ürün listesini görmek için önce X-Admin-Key girin.
            </p>
          ) : productsLoading ? (
            <p className="mt-4 text-sm text-slate-500">Ürünler yükleniyor...</p>
          ) : productsError ? (
            <p className="mt-4 text-sm text-red-500">Ürünler alınamadı.</p>
          ) : sortedProducts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Bu kategoriye ait ürün bulunamadı.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{product.name}</h3>
                      {product.description ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {product.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                      ₺{Number(product.price).toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      ID: {product.id}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      CategoryId: {product.categoryId}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      SortOrder: {product.sortOrder ?? 0}
                    </span>
                  </div>

                  {product.imageUrl ? (
                    <div className="mt-3">
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="h-32 w-full rounded-2xl object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}