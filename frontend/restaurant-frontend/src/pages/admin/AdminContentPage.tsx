import { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useAdminSession } from "../../features/admin/context/AdminSessionContext";
import { getImageUrl } from "@/shared/lib/getImageUrl";
import { uploadProductImage } from "../../features/uploads/api/uploadApi";

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

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [lastUploadDuplicated, setLastUploadDuplicated] = useState<boolean | null>(null);
  const [lastUploadedSha256, setLastUploadedSha256] = useState<string>("");

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
      setSelectedImageFile(null);
      setLastUploadDuplicated(null);
      setLastUploadedSha256("");
      setMessage("İçerik başarıyla yüklendi.");
    } catch (error) {
      console.error(error);
      setMessage("İçerik yüklenemedi.");
      setTitle("");
      setBody("");
      setImageUrl("");
      setSelectedImageFile(null);
      setLastUploadDuplicated(null);
      setLastUploadedSha256("");
    } finally {
      setLoadingContent(false);
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

      setImageUrl(data.imageUrl);
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

  const isSuccessMessage =
    message.toLowerCase().includes("başarı") ||
    message.toLowerCase().includes("kaydedildi") ||
    message.toLowerCase().includes("yüklendi") ||
    message.toLowerCase().includes("kullanıldı");

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">İçerik Yönetimi</h1>
        <p className="mt-1 text-sm text-slate-600">
          İçeriği anahtara göre getirip düzenleyin, görsel yükleyin ve önizleyin.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">İçerik Düzenle</h2>

          <div className="mt-4 space-y-4">
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

            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700">
                İçerik Görseli
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
                    setImageUrl("");
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
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/uploads/content/homepage.jpg"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              {imageUrl ? (
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
                    URL: {imageUrl}
                  </p>
                </div>
              ) : null}
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
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "İçeriği Kaydet"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">İçerik Önizleme</h2>
          <p className="mt-1 text-sm text-slate-500">
            Yüklenen görsel ve içerik burada önizlenir.
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Content Key
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{keyValue || "-"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Başlık
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {title || "Henüz başlık girilmedi."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Metin
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                {body || "Henüz metin girilmedi."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Görsel Önizleme
              </p>

              <div className="mt-3 overflow-hidden rounded-2xl bg-slate-100">
                {imageUrl ? (
                  <img
                    src={getImageUrl(imageUrl)}
                    alt="İçerik görseli"
                    className="h-72 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                    Henüz görsel yüklenmedi.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}