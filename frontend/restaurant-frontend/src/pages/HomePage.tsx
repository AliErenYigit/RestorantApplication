import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createComment } from "../features/home/api/commentApi";
import { useHomepageData } from "../features/home/hooks/useHomepageData";
import type { CreateCommentRequest } from "../features/home/types/homeTypes";

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

type RevealProps = {
  children: React.ReactNode;
  delayClassName?: string;
  className?: string;
};

function Reveal({ children, delayClassName = "", className = "" }: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={[
        "transform transition-all duration-700 ease-out",
        delayClassName,
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

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
    <div className="bg-transparent text-slate-100">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#181c20] shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(249,115,22,0.12),transparent_24%),radial-gradient(circle_at_82%_24%,rgba(234,179,8,0.10),transparent_20%),radial-gradient(circle_at_60%_78%,rgba(255,255,255,0.04),transparent_22%)]" />
          <div className="absolute left-[-60px] top-[40px] h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-[8%] top-[10%] h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <div className="mx-auto grid min-h-[72vh] max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-6 lg:px-8 lg:py-20">
          <Reveal className="relative z-10">
            <div className="text-center md:text-left">
              <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300 shadow-sm">
                CityIstanbul
              </span>

              {isLoading ? (
                <div className="mt-6 space-y-4">
                  <div className="h-10 w-3/4 animate-pulse rounded-xl bg-white/10 md:w-full" />
                  <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
                </div>
              ) : (
                <>
                  <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                    {title}
                  </h1>

                  <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-8 text-slate-300 md:text-lg">
                    {body}
                  </p>
                </>
              )}

              {hasError && (
                <p className="mt-4 inline-flex rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
                  Backend verileri alınamadı. Varsayılan içerik gösteriliyor olabilir.
                </p>
              )}

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start">
                <Link
                  to="/menu"
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-400 active:scale-[0.98]"
                >
                  Menüyü Aç
                </Link>

                <a
                  href="#comments"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
                >
                  Yorumları İncele
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delayClassName="delay-150" className="relative z-10">
            <div className="flex justify-center md:justify-end">
              {heroImageUrl ? (
                <div className="group relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#23272d] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                  <img
                    src={heroImageUrl}
                    alt={title}
                    className="h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:h-[470px]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="flex h-[280px] w-full max-w-xl items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-[#23272d] text-center shadow-sm md:h-[470px]">
                  <div className="px-6">
                    <p className="text-lg font-semibold text-slate-200">Öne çıkan görsel</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Anasayfa için görsel eklediğinde burada gösterilecek.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl rounded-[2rem] border border-white/10 bg-[#181c20] px-4 py-16 shadow-[0_16px_40px_rgba(0,0,0,0.22)] md:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 shadow-sm">
              Ekibimiz
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Çalışanlarımız
            </h2>
            <p className="mt-3 text-slate-400">
              Ekibimiz sizlere en iyi hizmeti sunmak için her gün özenle çalışıyor.
            </p>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#23272d] p-5 shadow-sm"
              >
                <div className="h-56 animate-pulse rounded-2xl bg-white/10" />
                <div className="mt-4 h-5 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : teamMembers.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => {
              const imageUrl = resolveImageUrl(member.imageUrl);

              return (
                <Reveal
                  key={member.id}
                  delayClassName={
                    index % 3 === 0 ? "" : index % 3 === 1 ? "delay-100" : "delay-200"
                  }
                >
                  <article className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#23272d] shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(249,115,22,0.14)]">
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_45%)]" />
                    </div>

                    <div className="overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={member.fullName}
                          className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-64 items-center justify-center bg-[#2a2f34] text-slate-400">
                          Çalışan görseli
                        </div>
                      )}
                    </div>

                    <div className="relative p-6">
                      <div className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                        {member.role}
                      </div>

                      <h3 className="mt-4 text-xl font-bold text-white">
                        {member.fullName}
                      </h3>

                      {member.bio && (
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-dashed border-white/10 bg-[#23272d] p-8 text-center text-slate-400">
            Şu anda gösterilecek çalışan bilgisi bulunmuyor.
          </div>
        )}
      </section>

      <section
        id="comments"
        className="mx-auto mt-8 max-w-7xl rounded-[2rem] border border-white/10 bg-[#181c20] shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
      >
        <div className="px-4 py-16 md:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Misafir Deneyimleri
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
                Müşteri Yorumları
              </h2>

              <p className="mt-3 text-slate-400">
                Restoranımızı ziyaret eden misafirlerimizin düşünceleri.
              </p>
            </div>
          </Reveal>

          {isLoading ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[2rem] border border-white/10 bg-[#23272d] p-5 shadow-sm"
                >
                  <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 h-4 w-full animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comments.map((comment, index) => (
                <Reveal
                  key={comment.id}
                  delayClassName={
                    index % 3 === 0 ? "" : index % 3 === 1 ? "delay-100" : "delay-200"
                  }
                >
                  <article className="group h-full rounded-[2rem] border border-white/10 bg-[#23272d] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/20 hover:shadow-[0_18px_38px_rgba(249,115,22,0.10)]">
                    <div className="flex items-center gap-1 text-amber-400">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-white">
                      {comment.firstName} {comment.lastName}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {comment.message}
                    </p>

                    <p className="mt-5 text-xs font-medium text-slate-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[2rem] border border-dashed border-white/10 bg-[#23272d] p-8 text-center text-slate-400">
              Henüz yayınlanmış yorum bulunmuyor.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-4xl rounded-[2rem] border border-white/10 bg-[#181c20] px-4 py-16 shadow-[0_16px_40px_rgba(0,0,0,0.22)] md:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <div className="rounded-[2rem] border border-white/10 bg-[#23272d] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-8">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Görüşünüz Bizim İçin Önemli
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                Yorum Bırakın
              </h2>

              <p className="mt-3 text-slate-400">
                Deneyiminizi bizimle paylaşın. Yorumunuz onaylandıktan sonra yayınlanacaktır.
              </p>
            </div>

            <form onSubmit={handleSubmitComment} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-medium text-slate-300"
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
                    className="w-full rounded-2xl border border-white/10 bg-[#181c20] px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-medium text-slate-300"
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
                    className="w-full rounded-2xl border border-white/10 bg-[#181c20] px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-slate-300"
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
                  className="w-full rounded-2xl border border-white/10 bg-[#181c20] px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              {submitSuccessMessage && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {submitSuccessMessage}
                </div>
              )}

              {submitErrorMessage && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {submitErrorMessage}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading ? "Gönderiliyor..." : "Yorumu Gönder"}
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      </section>
    </div>
  );
}