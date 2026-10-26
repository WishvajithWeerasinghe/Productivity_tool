import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../hooks/useAuth";
import NavigationMenu from "./NavigationMenu";
import logo from "../assets/logo.png";

export default function AppHeader() {
  const { data: user } = useCurrentUser();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-brand-50 text-brand-700"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-200/70 pb-5 lg:flex lg:flex-wrap lg:justify-between">
      <div className="contents lg:flex lg:flex-wrap lg:items-center lg:gap-8">
        <NavLink to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900">
          <img src={logo} alt="" className="h-9 w-9 rounded-xl object-contain shadow-md shadow-brand-200" />
          DevFlow
        </NavLink>
        <nav aria-label="Main navigation" className="order-3 col-span-2 flex flex-wrap items-center gap-1 lg:order-none">
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/meeting-notes" className={linkClass}>Meeting notes</NavLink>
          <NavLink to="/journal" className={linkClass}>Journal</NavLink>
        </nav>
      </div>
      <div className="col-start-2 row-start-1 flex items-center gap-3">
        <span aria-hidden="true" className="hidden h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-bold uppercase text-amber-800 sm:flex">
          {user?.name?.trim().charAt(0) || "U"}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium text-slate-700 sm:inline">{user?.name || "Your account"}</span>
        <NavigationMenu user={user} />
      </div>
    </header>
  );
}
