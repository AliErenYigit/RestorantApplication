import { Link } from "react-router-dom";

const cards = [
  {
    title: "Menü Yönetimi",
    description: "Kategoriye göre ürün ekleyin ve ürünleri önizleyin.",
    to: "/admin/menu",
  },
  {
    title: "İçerik Yönetimi",
    description: "Anasayfa gibi içerikleri güncelleyin.",
    to: "/admin/content",
  },
  {
    title: "Çalışanlarımız",
    description: "Ekip üyelerini ekleyin.",
    to: "/admin/members",
  },
  {
    title: "Yorumlar",
    description: "Yorumları görüntüleyin ve onaylayın.",
    to: "/admin/comments",
  },
];

export function AdminDashboardPage() {
  return (
    <section>
      <div className="rounded-[2rem] bg-slate-900 px-8 py-10 text-white shadow">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Sol menüden ilgili yönetim ekranına geçebilirsiniz.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.to}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {card.description}
            </p>

            <Link
              to={card.to}
              className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sayfaya Git
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}