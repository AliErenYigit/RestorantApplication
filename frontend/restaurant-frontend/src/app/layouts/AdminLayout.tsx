import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  AdminSessionContext,
} from "../../features/admin/context/AdminSessionContext";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/menu", label: "Menü Yönetimi" },
  { to: "/admin/content", label: "İçerik Yönetimi" },
  { to: "/admin/members", label: "Çalışanlarımız" },
  { to: "/admin/comments", label: "Yorumlar" },
];

export function AdminLayout() {
  const [adminKey, setAdminKey] = useState("");

  return (
    <AdminSessionContext.Provider value={{ adminKey, setAdminKey }}>
      <div className="min-h-screen bg-slate-100">
        <div className="flex min-h-screen">
          <aside className="w-72 border-r border-slate-200 bg-slate-900 text-white">
            <div className="border-b border-slate-800 px-6 py-5">
              <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
              <p className="mt-1 text-sm text-slate-400">
                Restoran yönetim ekranı
              </p>
            </div>

            <nav className="flex flex-col gap-2 p-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-white text-slate-900 shadow"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-4 border-t border-slate-800 pt-4">
                <NavLink
                  to="/"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Siteye Dön
                </NavLink>
              </div>
            </nav>
          </aside>

          <div className="flex min-h-screen flex-1 flex-col">
            <header className="border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Yönetim Paneli
                  </h2>
                  <p className="text-sm text-slate-500">
                    İçerik, yorum, çalışan ve menü yönetimi
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    X-Admin-Key
                  </label>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="X-Admin-Key değeri"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </header>

            <main className="flex-1 px-6 py-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </AdminSessionContext.Provider>
  );
}