import { Outlet, NavLink } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111315] text-slate-100">
      
      {/* decorative background lights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[120px] h-80 w-80 rounded-full bg-[#ff8a3c] opacity-20 blur-3xl" />
        <div className="absolute right-[-120px] top-[220px] h-96 w-96 rounded-full bg-[#f97316] opacity-20 blur-3xl" />
        <div className="absolute left-[20%] bottom-[100px] h-80 w-80 rounded-full bg-[#eab308] opacity-10 blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111315]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          <NavLink to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="text-orange-400">City</span>
            <span className="text-white">Istanbul</span>
          </NavLink>

          <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1c1f23] p-1">
            
            <NavLink
              to="/"
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-orange-500 text-white shadow"
                    : "text-slate-300 hover:bg-[#2a2f34]",
                ].join(" ")
              }
            >
              Ana Sayfa
            </NavLink>

            <NavLink
              to="/menu"
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-orange-500 text-white shadow"
                    : "text-slate-300 hover:bg-[#2a2f34]",
                ].join(" ")
              }
            >
              Menü
            </NavLink>

          </nav>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}