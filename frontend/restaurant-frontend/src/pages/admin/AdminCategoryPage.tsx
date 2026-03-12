import { useEffect, useState } from "react";
import axios from "axios";
import { useAdminSession } from "../../features/admin/context/AdminSessionContext";

const API_BASE_URL = "http://localhost:5041";

type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  isActive?: boolean;
};

export function AdminCategoryPage() {
  const { adminKey } = useAdminSession();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [togglingCategoryId, setTogglingCategoryId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    sortOrder: 1,
    isActive: true,
  });

  const resetForm = () => {
    setEditingCategoryId(null);
    setForm({
      name: "",
      slug: "",
      sortOrder: 1,
      isActive: true,
    });
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "sortOrder" ? Number(value) : value,
    }));
  }

  async function fetchCategories() {
    if (!adminKey.trim()) {
      setCategories([]);
      return;
    }

    try {
      setLoadingCategories(true);
      setMessage("");

      const response = await axios.get<CategoryItem[]>(
        `${API_BASE_URL}/api/admin/categories`,
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );

      setCategories(response.data ?? []);
    } catch (error) {
      console.error(error);
      setMessage("Kategori listesi alınamadı.");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    if (!form.name.trim()) {
      setMessage("Kategori adı zorunludur.");
      return;
    }

    if (!form.slug.trim()) {
      setMessage("Slug zorunludur.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingCategoryId !== null) {
        await axios.put(
          `${API_BASE_URL}/api/admin/categories/${editingCategoryId}`,
          form,
          {
            headers: {
              "X-Admin-Key": adminKey,
            },
          }
        );

        setMessage("Kategori başarıyla güncellendi.");
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/categories`, form, {
          headers: {
            "X-Admin-Key": adminKey,
          },
        });

        setMessage("Kategori başarıyla eklendi.");
      }

      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error(error);
      setMessage(
        editingCategoryId !== null
          ? "Kategori güncellenirken hata oluştu."
          : "Kategori eklenirken hata oluştu."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(category: CategoryItem) {
    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    try {
      setTogglingCategoryId(category.id);
      setMessage("");

      await axios.patch(
        `${API_BASE_URL}/api/admin/categories/${category.id}/toggle-active`,
        {
          isActive: !(category.isActive ?? true),
        },
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );

      setMessage(
        category.isActive === false
          ? "Kategori başarıyla aktifleştirildi."
          : "Kategori başarıyla pasifleştirildi."
      );

      if (editingCategoryId === category.id) {
        setForm((prev) => ({
          ...prev,
          isActive: !(category.isActive ?? true),
        }));
      }

      await fetchCategories();
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; error?: string; detail?: string }
          | undefined;

        setMessage(
          responseData?.message ||
            responseData?.error ||
            responseData?.detail ||
            "Kategori aktiflik durumu değiştirilemedi."
        );
      } else {
        setMessage("Kategori aktiflik durumu değiştirilemedi.");
      }
    } finally {
      setTogglingCategoryId(null);
    }
  }

  function handleEdit(category: CategoryItem) {
    setEditingCategoryId(category.id);
    setForm({
      name: category.name ?? "",
      slug: category.slug ?? "",
      sortOrder: category.sortOrder ?? 1,
      isActive: category.isActive ?? true,
    });
    setMessage("Kategori bilgileri düzenleme için forma yüklendi.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteCategory(id: number) {
    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    const confirmed = window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    try {
      setDeletingCategoryId(id);

      await axios.delete(`${API_BASE_URL}/api/admin/categories/${id}`, {
        headers: {
          "X-Admin-Key": adminKey,
        },
      });

      if (editingCategoryId === id) {
        resetForm();
      }

      setMessage("Kategori başarıyla silindi.");
      await fetchCategories();
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; error?: string; detail?: string }
          | undefined;

        setMessage(
          responseData?.message ||
            responseData?.error ||
            responseData?.detail ||
            "Kategori silinirken hata oluştu."
        );
      } else {
        setMessage("Kategori silinirken hata oluştu.");
      }
    } finally {
      setDeletingCategoryId(null);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, [adminKey]);

  const isSuccessMessage =
    message.toLowerCase().includes("başarı") ||
    message.toLowerCase().includes("eklendi") ||
    message.toLowerCase().includes("güncellendi") ||
    message.toLowerCase().includes("silindi") ||
    message.toLowerCase().includes("aktifleştirildi") ||
    message.toLowerCase().includes("pasifleştirildi");

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Kategori Yönetimi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Kategori ekleyin, güncelleyin, aktiflik durumunu değiştirin ve silin.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingCategoryId !== null ? "Kategoriyi Güncelle" : "Kategori Ekle"}
            </h2>

            {editingCategoryId !== null ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Düzenlemeyi İptal Et
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kategori Adı
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Örn: İçecekler"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Slug
              </label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="icecekler"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sıralama
              </label>
              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="categoryIsActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              <label
                htmlFor="categoryIsActive"
                className="text-sm font-medium text-slate-700"
              >
                Aktif kategori
              </label>
            </div>

            {message ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  isSuccessMessage
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-fit rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? editingCategoryId !== null
                  ? "Güncelleniyor..."
                  : "Ekleniyor..."
                : editingCategoryId !== null
                ? "Kategoriyi Güncelle"
                : "Kategori Ekle"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Mevcut Kategoriler</h2>

            <button
              type="button"
              onClick={fetchCategories}
              disabled={!adminKey.trim() || loadingCategories}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Yenile
            </button>
          </div>

          {!adminKey.trim() ? (
            <p className="mt-4 text-sm text-slate-500">
              Kategori listesini görmek için önce X-Admin-Key girin.
            </p>
          ) : loadingCategories ? (
            <p className="mt-4 text-sm text-slate-500">Kategoriler yükleniyor...</p>
          ) : categories.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Kategori bulunamadı.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {categories.map((category) => {
                const isInactive = category.isActive === false;

                return (
                  <div
                    key={category.id}
                    className={[
                      "rounded-2xl border p-4 transition",
                      isInactive
                        ? "border-slate-200 bg-slate-50 opacity-70"
                        : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {category.name}
                          </h3>

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

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          Slug: {category.slug}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2 py-1">
                            ID: {category.id}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-1">
                            SortOrder: {category.sortOrder}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                        >
                          Güncelle
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(category)}
                          disabled={togglingCategoryId === category.id}
                          className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
                            category.isActive === false
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-slate-600 hover:bg-slate-700"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {togglingCategoryId === category.id
                            ? "İşleniyor..."
                            : category.isActive === false
                            ? "Aktifleştir"
                            : "Pasifleştir"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deletingCategoryId === category.id}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingCategoryId === category.id ? "Siliniyor..." : "Sil"}
                        </button>
                      </div>
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