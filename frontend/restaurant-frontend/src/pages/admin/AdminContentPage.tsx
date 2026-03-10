import { useState } from "react";
import axios from "axios";
import { useAdminSession } from "../../features/admin/context/AdminSessionContext";

const API_BASE_URL = "http://localhost:5041";

type SiteContentDto = {
  key: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  updatedAt: string;
};

export function AdminContentPage() {
  const { adminKey } = useAdminSession();

  const [keyValue, setKeyValue] = useState("homepage");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleLoadContent() {
    setMessage("");

    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    if (!keyValue.trim()) {
      setMessage("Lütfen bir content key girin.");
      return;
    }

    try {
      setLoadingContent(true);

      const response = await axios.get<SiteContentDto>(
        `${API_BASE_URL}/api/admin/content/${keyValue}`,
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );

      const data = response.data;

      setTitle(data.title ?? "");
      setBody(data.body ?? "");
      setImageUrl(data.imageUrl ?? "");
      setMessage("İçerik başarıyla yüklendi.");
    } catch (error) {
      console.error(error);
      setMessage("İçerik yüklenemedi.");
      setTitle("");
      setBody("");
      setImageUrl("");
    } finally {
      setLoadingContent(false);
    }
  }

  async function handleSave() {
    setMessage("");

    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    if (!keyValue.trim()) {
      setMessage("Lütfen bir content key girin.");
      return;
    }

    if (!title.trim()) {
      setMessage("Başlık zorunludur.");
      return;
    }

    if (!body.trim()) {
      setMessage("Metin zorunludur.");
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `${API_BASE_URL}/api/admin/content/${keyValue}`,
        {
          title,
          body,
          imageUrl: imageUrl || null,
        },
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );

      setMessage("İçerik başarıyla kaydedildi.");
    } catch (error) {
      console.error(error);
      setMessage("İçerik kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">İçerik Yönetimi</h1>
        <p className="mt-2 text-slate-600">
          İçerikleri anahtara göre getirip düzenleyebilirsiniz.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Content Key
            </label>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="Örn: homepage"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />

              <button
                type="button"
                onClick={handleLoadContent}
                disabled={loadingContent}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingContent ? "Yükleniyor..." : "İçeriği Getir"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Başlık
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Metin
            </label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Görsel URL
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/uploads/content/homepage.jpg"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          {message ? (
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}