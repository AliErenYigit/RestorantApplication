import { Link } from "react-router-dom";
import { useState } from "react";
import { createComment } from "../features/home/api/commentApi";
import { useHomepageData } from "../features/home/hooks/useHomepageData";
import type { CreateCommentRequest } from "../features/home/types/homeTypes";

export function HomePage() {
  const {
    teamMembers,
    comments,
    isLoading,
    hasError,
    title,
    body,
    heroImageUrl,
    resolveImageUrl,
  } = useHomepageData();

  const [form, setForm] = useState<CreateCommentRequest>({
    firstName: "",
    lastName: "",
    message: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitSuccessMessage("");
    setSubmitErrorMessage("");

    const trimmedFirstName = form.firstName.trim();
    const trimmedLastName = form.lastName.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedMessage) {
      setSubmitErrorMessage("Lütfen ad, soyad ve yorum alanlarını doldurun.");
      return;
    }

    try {
      setSubmitLoading(true);

      const message = await createComment({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        message: trimmedMessage,
      });

      setSubmitSuccessMessage(message);

      setForm({
        firstName: "",
        lastName: "",
        message: "",
      });
    } catch (error) {
      console.error("Comment submit failed:", error);
      setSubmitErrorMessage("Yorum gönderilirken bir hata oluştu.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid min-h-[70vh] max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 lg:px-8">
          <div className="text-center md:text-left">
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Restoran Menüsü
            </span>

            {isLoading ? (
              <div className="mt-6 space-y-4">
                <div className="h-10 w-3/4 animate-pulse rounded-xl bg-slate-200 md:w-full" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              </div>
            ) : (
              <>
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                  {title}
                </h1>

                <p className="mt-4 whitespace-pre-line text-base leading-7 text-slate-600 md:text-lg">
                  {body}
                </p>
              </>
            )}

            {hasError && (
              <p className="mt-4 text-sm text-amber-600">
                Backend verileri alınamadı. Varsayılan içerik gösteriliyor olabilir.
              </p>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <Link
                to="/menu"
                className="inline-flex rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
              >
                Menüyü Aç
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            {heroImageUrl ? (
              <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
                <img
                  src={heroImageUrl}
                  alt={title}
                  className="h-[260px] w-full object-cover md:h-[420px]"
                />
              </div>
            ) : (
              <div className="flex h-[260px] w-full max-w-xl items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center shadow-sm md:h-[420px]">
                <div className="px-6">
                  <p className="text-lg font-semibold text-slate-700">Öne çıkan görsel</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Anasayfa için görsel eklediğinde burada gösterilecek.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Çalışanlarımız
          </h2>
          <p className="mt-3 text-slate-600">
            Ekibimiz sizlere en iyi hizmeti sunmak için her gün özenle çalışıyor.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
                <div className="mt-4 h-5 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : teamMembers.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => {
              const imageUrl = resolveImageUrl(member.imageUrl);

              return (
                <article
                  key={member.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={member.fullName}
                      className="h-60 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-60 items-center justify-center bg-slate-100 text-slate-500">
                      Çalışan görseli
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {member.fullName}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">{member.role}</p>
                    {member.bio && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{member.bio}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Şu anda gösterilecek çalışan bilgisi bulunmuyor.
          </div>
        )}
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Müşteri Yorumları
            </h2>
            <p className="mt-3 text-slate-600">
              Restoranımızı ziyaret eden misafirlerimizin düşünceleri.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {comment.firstName} {comment.lastName}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{comment.message}</p>
                  <p className="mt-4 text-xs text-slate-400">
                    {formatDate(comment.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Henüz yayınlanmış yorum bulunmuyor.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 md:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Yorum Bırakın
            </h2>
            <p className="mt-3 text-slate-600">
              Deneyiminizi bizimle paylaşın. Yorumunuz onaylandıktan sonra yayınlanacaktır.
            </p>
          </div>

          <form onSubmit={handleSubmitComment} className="mt-8 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Ad
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleInputChange}
                  placeholder="Adınız"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Soyad
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleInputChange}
                  placeholder="Soyadınız"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Yorum
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleInputChange}
                placeholder="Yorumunuzu yazın"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {submitSuccessMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {submitSuccessMessage}
              </div>
            )}

            {submitErrorMessage && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitErrorMessage}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitLoading}
                className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? "Gönderiliyor..." : "Yorumu Gönder"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}