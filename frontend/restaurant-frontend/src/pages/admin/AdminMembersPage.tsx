import { useEffect, useState } from "react";
import axios from "axios";
import { useAdminSession } from "../../features/admin/context/AdminSessionContext";
import { getImageUrl } from "@/shared/lib/getImageUrl";

const API_BASE_URL = "http://localhost:5041";

type TeamMember = {
  id: number;
  fullName: string;
  role: string;
  bio?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
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
      setLoadingMembers(false);
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

    try {
      setSubmitting(true);

      await axios.post(`${API_BASE_URL}/api/admin/team-members`, form, {
        headers: {
          "X-Admin-Key": adminKey,
        },
      });

      setMessage("Çalışan başarıyla eklendi.");

      setForm({
        fullName: "",
        role: "",
        bio: "",
        imageUrl: "",
        sortOrder: 0,
        isActive: true,
      });

      await fetchMembers();
    } catch (error) {
      console.error(error);
      setMessage("Çalışan eklenirken hata oluştu.");
    } finally {
      setSubmitting(false);
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

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Çalışanlarımız</h1>
        <p className="mt-2 text-slate-600">
          Ekip üyelerini ekleyin, listeleyin ve silin.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Çalışan Ekle</h2>

          <div className="mt-5 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ad Soyad
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
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
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Görsel URL
              </label>
              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
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

            {message ? (
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-fit rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Ekleniyor..." : "Çalışan Ekle"}
            </button>
          </div>
        </form>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
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
              {members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-slate-200 p-4"
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
                        <h3 className="text-lg font-semibold text-slate-900">
                          {member.fullName}
                        </h3>
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

                    <div>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}