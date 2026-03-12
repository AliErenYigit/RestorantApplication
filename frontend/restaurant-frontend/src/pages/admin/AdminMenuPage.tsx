import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "../../features/categories/api/categoryApi";
import { createProduct } from "../../features/products/api/productApi";
import { uploadProductImage } from "../../features/uploads/api/uploadApi";
import type { CreateProductRequest } from "../../features/products/types/createProductRequest";
import { getImageUrl } from "@/shared/lib/getImageUrl";
import { useAdminSession } from "../../features/admin/context/AdminSessionContext";
import axios from "axios";

const API_BASE_URL = "http://localhost:5041";

type AdminProductItem = {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isActive?: boolean;
};

type AdminProductsApiResponse =
  | AdminProductItem[]
  | {
      items?: AdminProductItem[];
      data?: AdminProductItem[];
      products?: AdminProductItem[];
    };

async function getAdminProducts(adminKey: string): Promise<AdminProductsApiResponse> {
  const response = await axios.get<AdminProductsApiResponse>(
    `${API_BASE_URL}/api/admin/products`,
    {
      headers: {
        "X-Admin-Key": adminKey,
      },
    }
  );

  return response.data;
}

function normalizeProducts(input: AdminProductsApiResponse | undefined): AdminProductItem[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (!input || typeof input !== "object") {
    return [];
  }

  if (Array.isArray(input.items)) {
    return input.items;
  }

  if (Array.isArray(input.data)) {
    return input.data;
  }

  if (Array.isArray(input.products)) {
    return input.products;
  }

  return [];
}

export function AdminMenuPage() {
  const queryClient = useQueryClient();
  const { adminKey } = useAdminSession();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [lastUploadDuplicated, setLastUploadDuplicated] = useState<boolean | null>(null);
  const [lastUploadedSha256, setLastUploadedSha256] = useState<string>("");
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<number | null>(null);

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
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
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
    data: adminProductsResponse,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["admin-products", adminKey],
    queryFn: () => getAdminProducts(adminKey),
    enabled: !!adminKey.trim(),
  });

  const allProducts = useMemo(() => {
    return normalizeProducts(adminProductsResponse);
  }, [adminProductsResponse]);

  const filteredProducts = useMemo(() => {
    if (!effectiveCategoryId) return [];

    return allProducts.filter(
      (product) => product.categoryId === effectiveCategoryId
    );
  }, [allProducts, effectiveCategoryId]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
  }, [filteredProducts]);

  const resetForm = () => {
    setEditingProductId(null);
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
  };

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
      resetForm();

      await queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-products"],
      });
    },
    onError: (error: unknown) => {
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

  const updateProductMutation = useMutation({
    mutationFn: async () => {
      return axios.put(
        `${API_BASE_URL}/api/admin/products/${editingProductId}`,
        {
          categoryId: effectiveCategoryId,
          ...form,
        },
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );
    },
    onSuccess: async () => {
      setStatusMessage("Ürün başarıyla güncellendi.");
      resetForm();

      await queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-products"],
      });
    },
    onError: (error: unknown) => {
      let apiMessage = "Ürün güncellenirken hata oluştu.";

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; error?: string; detail?: string }
          | undefined;

        apiMessage =
          responseData?.message ||
          responseData?.error ||
          responseData?.detail ||
          error.message ||
          "Ürün güncellenirken hata oluştu.";
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

  const handleEditProduct = (product: AdminProductItem) => {
    setEditingProductId(product.id);
    setSelectedCategoryId(product.categoryId);
    setForm({
      name: product.name,
      price: Number(product.price),
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? "",
      sortOrder: product.sortOrder ?? 1,
      isActive: product.isActive ?? true,
    });
    setSelectedImageFile(null);
    setLastUploadDuplicated(null);
    setLastUploadedSha256("");
    setStatusMessage("Ürün bilgileri düzenleme için forma yüklendi.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function handleDeleteProduct(productId: number) {
    if (!adminKey.trim()) {
      setStatusMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    const confirmed = window.confirm("Bu ürünü silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    try {
      setDeletingProductId(productId);
      setStatusMessage("");

      await axios.delete(`${API_BASE_URL}/api/admin/products/${productId}`, {
        headers: {
          "X-Admin-Key": adminKey,
        },
      });

      if (editingProductId === productId) {
        resetForm();
      }

      setStatusMessage("Ürün başarıyla silindi.");

      await queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-products"],
      });
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; error?: string; detail?: string }
          | undefined;

        setStatusMessage(
          responseData?.message ||
            responseData?.error ||
            responseData?.detail ||
            "Ürün silinirken hata oluştu."
        );
      } else {
        setStatusMessage("Ürün silinirken hata oluştu.");
      }
    } finally {
      setDeletingProductId(null);
    }
  }

  async function handleToggleProductActive(product: AdminProductItem) {
    if (!adminKey.trim()) {
      setStatusMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    try {
      setTogglingProductId(product.id);
      setStatusMessage("");

      await axios.patch(
        `${API_BASE_URL}/api/admin/products/${product.id}/toggle-active`,
        {
          isActive: !(product.isActive ?? true),
        },
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );

      if (editingProductId === product.id) {
        setForm((prev) => ({
          ...prev,
          isActive: !(product.isActive ?? true),
        }));
      }

      setStatusMessage(
        product.isActive === false
          ? "Ürün başarıyla aktifleştirildi."
          : "Ürün başarıyla pasifleştirildi."
      );

      await queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-products"],
      });
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; error?: string; detail?: string }
          | undefined;

        setStatusMessage(
          responseData?.message ||
            responseData?.error ||
            responseData?.detail ||
            "Ürün aktiflik durumu değiştirilemedi."
        );
      } else {
        setStatusMessage("Ürün aktiflik durumu değiştirilemedi.");
      }
    } finally {
      setTogglingProductId(null);
    }
  }

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

    const selectedCategoryEntity = sortedCategories.find(
      (c) => c.id === effectiveCategoryId
    );

    if (selectedCategoryEntity?.isActive === false) {
      setStatusMessage("Pasif kategoriye ürün eklenemez veya güncellenemez.");
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

    if (editingProductId !== null) {
      updateProductMutation.mutate();
    } else {
      createProductMutation.mutate();
    }
  };

  const isBusy = createProductMutation.isPending || updateProductMutation.isPending;

  const isSuccessMessage =
    statusMessage.toLowerCase().includes("başarı") ||
    statusMessage.toLowerCase().includes("oluşturuldu") ||
    statusMessage.toLowerCase().includes("güncellendi") ||
    statusMessage.toLowerCase().includes("silindi") ||
    statusMessage.toLowerCase().includes("aktifleştirildi") ||
    statusMessage.toLowerCase().includes("pasifleştirildi") ||
    statusMessage.toLowerCase().includes("yüklendi") ||
    statusMessage.toLowerCase().includes("kullanıldı");

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Menü Yönetimi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ürün ekleyin, güncelleyin, aktiflik durumunu değiştirin ve yönetin.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingProductId !== null ? "Ürünü Güncelle" : "Ürün Ekle"}
            </h2>

            {editingProductId !== null ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Düzenlemeyi İptal Et
              </button>
            ) : null}
          </div>

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
                    <option
                      key={category.id}
                      value={category.id}
                      disabled={category.isActive === false}
                    >
                      {category.name} {category.isActive === false ? "(Aktif değil)" : ""}
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

            {selectedCategory?.isActive === false ? (
              <p className="text-sm font-medium text-amber-600">
                Bu kategori aktif değil. Public tarafta görünmez ve seçilemez.
              </p>
            ) : null}

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
              disabled={isBusy}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy
                ? editingProductId !== null
                  ? "Güncelleniyor..."
                  : "Kaydediliyor..."
                : editingProductId !== null
                ? "Ürünü Güncelle"
                : "Ürünü Oluştur"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Kategoriye Ait Ürünler
          </h2>

          {selectedCategory ? (
            <div className="mt-1">
              <p className="text-sm text-slate-500">
                Seçili kategori:{" "}
                <span className="font-medium text-slate-700">{selectedCategory.name}</span>
              </p>

              {selectedCategory.isActive === false ? (
                <p className="mt-2 text-sm font-medium text-amber-600">
                  Bu kategori aktif değil. Public tarafta görünmez ve seçilemez.
                </p>
              ) : null}
            </div>
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
              {sortedProducts.map((product) => {
                const isInactive = product.isActive === false;

                return (
                  <div
                    key={product.id}
                    className={[
                      "rounded-2xl border p-4 transition",
                      isInactive
                        ? "border-slate-200 bg-slate-50 opacity-70"
                        : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{product.name}</h3>

                          {isInactive ? (
                            <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600">
                              Aktif değil
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700">
                              Aktif
                            </span>
                          )}
                        </div>

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

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                      >
                        Güncelle
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleProductActive(product)}
                        disabled={togglingProductId === product.id}
                        className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
                          isInactive
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-slate-600 hover:bg-slate-700"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {togglingProductId === product.id
                          ? "İşleniyor..."
                          : isInactive
                          ? "Aktifleştir"
                          : "Pasifleştir"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProductId === product.id}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingProductId === product.id ? "Siliniyor..." : "Sil"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}