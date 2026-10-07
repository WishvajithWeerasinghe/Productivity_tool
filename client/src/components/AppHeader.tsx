import { NavLink } from "react-router-dom";
import { useCurrentUser, useLogout } from "../hooks/useAuth";

export default function AppHeader() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm transition ${
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
    }`;

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <NavLink to="/" className="text-2xl font-bold text-white">
          DevFlow
        </NavLink>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/meeting-notes" className={linkClass}>
            Meeting notes
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">{user?.name}</span>
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="rounded bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700 disabled:opacity-60"
        >
          {logout.isPending ? "Logging out…" : "Log out"}
        </button>
      </div>
    </header>
  );
}
