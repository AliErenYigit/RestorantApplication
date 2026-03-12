import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useAdminSession } from "../../features/admin/context/AdminSessionContext";
import { getImageUrl } from "@/shared/lib/getImageUrl";
import { uploadProductImage } from "../../features/uploads/api/uploadApi";

const API_BASE_URL = "http://localhost:5041";

type TeamMember = {
  id: number;
  fullName: string;
  role: string;
  bio?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive?: boolean;
};

export function AdminMembersPage() {
  const { adminKey } = useAdminSession();

  const [form, setForm] = useState({
    fullName: "",
    role: "",
    bio: "",
    imageUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [message, setMessage] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [togglingMemberId, setTogglingMemberId] = useState<number | null>(null);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [lastUploadDuplicated, setLastUploadDuplicated] = useState<boolean | null>(null);
  const [lastUploadedSha256, setLastUploadedSha256] = useState<string>("");

  function resetForm() {
    setForm({
      fullName: "",
      role: "",
      bio: "",
      imageUrl: "",
      sortOrder: 0,
      isActive: true,
    });
    setSelectedImageFile(null);
    setLastUploadDuplicated(null);
    setLastUploadedSha256("");
    setEditingMemberId(null);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "sortOrder" ? Number(value) : value,
    }));
  }

  async function fetchMembers() {
    if (!adminKey.trim()) {
      setMembers([]);
     
      return;
    }

    try {
      setLoadingMembers(true);
      setMessage("");

      const response = await axios.get<TeamMember[]>(
        `${API_BASE_URL}/api/admin/team-members`,
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );

      setMembers(response.data ?? []);
    } catch (error) {
      console.error(error);
      setMessage("Çalışan listesi alınamadı.");
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }

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
        setMessage("Upload başarılı görünüyor ama imageUrl dönmedi.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        imageUrl: data.imageUrl,
      }));

      setLastUploadDuplicated(data.duplicated);
      setLastUploadedSha256(data.sha256);

      setMessage(
        data.duplicated
          ? "Aynı görsel daha önce yüklenmiş. Mevcut görsel URL'i kullanıldı."
          : "Görsel başarıyla yüklendi."
      );
    },
    onError: (error) => {
      setLastUploadDuplicated(null);
      setLastUploadedSha256("");
      setMessage(
        error instanceof Error
          ? error.message
          : "Görsel yüklenirken hata oluştu."
      );
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    if (!form.fullName.trim()) {
      setMessage("Ad Soyad zorunludur.");
      return;
    }

    if (!form.role.trim()) {
      setMessage("Pozisyon zorunludur.");
      return;
    }

    if (!form.imageUrl.trim()) {
      setMessage("Lütfen önce çalışan görseli yükleyin.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingMemberId !== null) {
        await axios.put(
          `${API_BASE_URL}/api/admin/team-members/${editingMemberId}`,
          form,
          {
            headers: {
              "X-Admin-Key": adminKey,
            },
          }
        );

        setMessage("Çalışan başarıyla güncellendi.");
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/team-members`, form, {
          headers: {
            "X-Admin-Key": adminKey,
          },
        });

        setMessage("Çalışan başarıyla eklendi.");
      }

      resetForm();
      await fetchMembers();
    } catch (error) {
      console.error(error);
      setMessage(
        editingMemberId !== null
          ? "Çalışan güncellenirken hata oluştu."
          : "Çalışan eklenirken hata oluştu."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(member: TeamMember) {
    setEditingMemberId(member.id);
    setForm({
      fullName: member.fullName ?? "",
      role: member.role ?? "",
      bio: member.bio ?? "",
      imageUrl: member.imageUrl ?? "",
      sortOrder: member.sortOrder ?? 0,
      isActive: member.isActive ?? true,
    });
    setSelectedImageFile(null);
    setLastUploadDuplicated(null);
    setLastUploadedSha256("");
    setMessage("Çalışan bilgileri düzenleme için forma yüklendi.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleToggleMemberActive(member: TeamMember) {
    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    try {
      setTogglingMemberId(member.id);
      setMessage("");

      await axios.patch(
        `${API_BASE_URL}/api/admin/team-members/${member.id}/toggle-active`,
        {
          isActive: !(member.isActive ?? true),
        },
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );

      if (editingMemberId === member.id) {
        setForm((prev) => ({
          ...prev,
          isActive: !(member.isActive ?? true),
        }));
      }

      setMessage(
        member.isActive === false
          ? "Çalışan başarıyla aktifleştirildi."
          : "Çalışan başarıyla pasifleştirildi."
      );

      await fetchMembers();
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
            "Çalışan aktiflik durumu değiştirilemedi."
        );
      } else {
        setMessage("Çalışan aktiflik durumu değiştirilemedi.");
      }
    } finally {
      setTogglingMemberId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    const confirmed = window.confirm("Bu çalışanı silmek istediğinize emin misiniz?");
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await axios.delete(`${API_BASE_URL}/api/admin/team-members/${id}`, {
        headers: {
          "X-Admin-Key": adminKey,
        },
      });

      if (editingMemberId === id) {
        resetForm();
      }

      setMessage("Çalışan başarıyla silindi.");
      await fetchMembers();
    } catch (error) {
      console.error(error);
      setMessage("Çalışan silinirken hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, [adminKey]);

  const isSuccessMessage =
    message.toLowerCase().includes("başarı") ||
    message.toLowerCase().includes("eklendi") ||
    message.toLowerCase().includes("silindi") ||
    message.toLowerCase().includes("güncellendi") ||
    message.toLowerCase().includes("aktifleştirildi") ||
    message.toLowerCase().includes("pasifleştirildi") ||
    message.toLowerCase().includes("yüklendi") ||
    message.toLowerCase().includes("kullanıldı");

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Çalışanlarımız</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ekip üyelerini ekleyin, güncelleyin, aktiflik durumunu değiştirin ve silin.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingMemberId !== null ? "Çalışanı Güncelle" : "Çalışan Ekle"}
            </h2>

            {editingMemberId !== null ? (
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
                Ad Soyad
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Pozisyon
              </label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="Örn: Şef"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Açıklama
              </label>
              <textarea
                name="bio"
                rows={4}
                value={form.bio}
                onChange={handleChange}
                placeholder="Kısa çalışan açıklaması"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700">
                Çalışan Görseli
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSelectedImageFile(file);
                  setMessage("");
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
                  Seçilen dosya:{" "}
                  <span className="font-medium">{selectedImageFile.name}</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Henüz görsel seçilmedi.</div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!selectedImageFile) {
                    setMessage("Lütfen önce bir görsel seçin.");
                    return;
                  }

                  if (!adminKey.trim()) {
                    setMessage("Lütfen önce X-Admin-Key girin.");
                    return;
                  }

                  setMessage("");
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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Görsel URL
                </label>
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="/uploads/team/member.jpg"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              {form.imageUrl ? (
                <div className="space-y-2">
                  <p className="text-xs text-green-700">
                    {lastUploadDuplicated
                      ? "Aynı görsel bulundu, mevcut dosya kullanıldı."
                      : "Görsel hazır."}
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
                    alt="Yüklenen çalışan görseli"
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
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="memberIsActive"
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
              <label htmlFor="memberIsActive" className="text-sm font-medium text-slate-700">
                Aktif çalışan
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
                ? editingMemberId !== null
                  ? "Güncelleniyor..."
                  : "Ekleniyor..."
                : editingMemberId !== null
                ? "Çalışanı Güncelle"
                : "Çalışan Ekle"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Mevcut Çalışanlar
            </h2>

            <button
              type="button"
              onClick={fetchMembers}
              disabled={!adminKey.trim() || loadingMembers}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Yenile
            </button>
          </div>

          {!adminKey.trim() ? (
            <p className="mt-4 text-sm text-slate-500">
              Çalışan listesini görmek için önce X-Admin-Key girin.
            </p>
          ) : loadingMembers ? (
            <p className="mt-4 text-sm text-slate-500">Çalışanlar yükleniyor...</p>
          ) : members.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Çalışan bulunamadı.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {members.map((member) => {
                const isInactive = member.isActive === false;

                return (
                  <div
                    key={member.id}
                    className={[
                      "rounded-2xl border p-4 transition",
                      isInactive
                        ? "border-slate-200 bg-slate-50 opacity-70"
                        : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        {member.imageUrl ? (
                          <img
                            src={getImageUrl(member.imageUrl)}
                            alt={member.fullName}
                            className="h-20 w-20 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-500">
                            Görsel yok
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {member.fullName}
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
                            {member.role}
                          </p>

                          {member.bio ? (
                            <p className="mt-2 text-sm text-slate-600">
                              {member.bio}
                            </p>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              ID: {member.id}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              SortOrder: {member.sortOrder}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(member)}
                          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                        >
                          Güncelle
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleMemberActive(member)}
                          disabled={togglingMemberId === member.id}
                          className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
                            isInactive
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-slate-600 hover:bg-slate-700"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {togglingMemberId === member.id
                            ? "İşleniyor..."
                            : isInactive
                            ? "Aktifleştir"
                            : "Pasifleştir"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(member.id)}
                          disabled={deletingId === member.id}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === member.id ? "Siliniyor..." : "Sil"}
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