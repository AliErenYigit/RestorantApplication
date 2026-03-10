import { Outlet, NavLink } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <NavLink
            to="/"
            className="group inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 md:text-xl"
          >
            <span className="text-[#e67e22] transition group-hover:text-[#d96d12]">
              City
            </span>

            <span className="relative flex h-7 w-7 items-center justify-center">
              <span className="absolute bottom-0 h-0 w-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-[#2e8b57]" />
              <span className="absolute bottom-[4px] h-0 w-0 border-l-[9px] border-r-[9px] border-t-[13px] border-l-transparent border-r-transparent border-t-white" />
              <span className="absolute left-[7px] top-[8px] h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="absolute right-[7px] top-[10px] h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="absolute top-[6px] h-1.5 w-1.5 rounded-full bg-[#f4c542]" />
            </span>

            <span className="text-[#e67e22] transition group-hover:text-[#d96d12]">
              Istanbul
            </span>
          </NavLink>

          <nav className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 p-1 shadow-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              Menü
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}