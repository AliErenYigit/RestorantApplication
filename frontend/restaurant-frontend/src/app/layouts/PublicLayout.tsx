import { Outlet, NavLink } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eefbfb] text-slate-800">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-100px] top-[80px] h-80 w-80 rounded-full bg-[#b8f3ef] opacity-50 blur-3xl" />
        <div className="absolute right-[-80px] top-[180px] h-96 w-96 rounded-full bg-[#c8f7ff] opacity-45 blur-3xl" />
        <div className="absolute left-[20%] bottom-[80px] h-72 w-72 rounded-full bg-[#d7fffa] opacity-50 blur-3xl" />
        <div className="absolute right-[15%] bottom-[20px] h-64 w-64 rounded-full bg-[#bdefff] opacity-35 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-[#cfeeed] bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="group inline-flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="text-[#14b8a6] transition group-hover:text-[#0f9f92]">
              City
            </span>

            <span className="relative flex h-7 w-7 items-center justify-center">
              <span className="absolute bottom-0 h-0 w-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-[#14b8a6]" />
              <span className="absolute bottom-[4px] h-0 w-0 border-l-[9px] border-r-[9px] border-t-[13px] border-l-transparent border-r-transparent border-t-white" />
              <span className="absolute left-[7px] top-[8px] h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span className="absolute right-[7px] top-[10px] h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span className="absolute top-[6px] h-1.5 w-1.5 rounded-full bg-amber-300" />
            </span>

            <span className="text-[#06b6d4] transition group-hover:text-[#0891b2]">
              Istanbul
            </span>
          </NavLink>

          <nav className="flex items-center gap-2 rounded-full border border-[#d7efee] bg-white/85 p-1 shadow-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-[#14b8a6] text-white shadow-sm"
                    : "text-slate-600 hover:bg-[#eefbfb] hover:text-slate-900",
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
                    ? "bg-[#06b6d4] text-white shadow-sm"
                    : "text-slate-600 hover:bg-[#eefbfb] hover:text-slate-900",
                ].join(" ")
              }
            >
              Menü
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}