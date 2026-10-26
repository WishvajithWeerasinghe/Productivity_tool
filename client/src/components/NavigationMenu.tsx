import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useLogout } from "../hooks/useAuth";
import { useNotifications } from "../contexts/NotificationContext";
import { User } from "../types";
import logo from "../assets/logo.png";

const icons = {
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  notes: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  journal: <><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1ZM12 5v15" /></>,
  settings: <><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /><circle cx="12" cy="12" r="3.5" /></>,
  arrow: <path d="m9 5 7 7-7 7" />,
  logout: <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M9 12h12m-4-4 4 4-4 4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
};

function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof icons; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name]}
    </svg>
  );
}

const links = [
  { to: "/", label: "Dashboard", description: "Tasks, focus & music", icon: "dashboard" },
  { to: "/meeting-notes", label: "Meeting notes", description: "Discussions & decisions", icon: "notes" },
  { to: "/journal", label: "Journal", description: "Your thoughts, day by day", icon: "journal" },
  { to: "/settings", label: "Settings", description: "Profile & appearance", icon: "settings" },
] as const;

export default function NavigationMenu({ user }: { user?: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const logout = useLogout();
  const {
    desktopPermission,
    desktopAlertsEnabled,
    enableDesktopAlerts,
    setDesktopAlertsEnabled,
  } = useNotifications();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="app-navigation-menu"
        className="glass-control inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <Icon name="menu" />
        <span>Menu</span>
      </button>

      <dialog
        ref={dialogRef}
        id="app-navigation-menu"
        aria-labelledby="navigation-menu-title"
        onCancel={closeMenu}
        onClose={closeMenu}
        onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}
        className="navigation-drawer fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-[calc(100%_-_1.5rem)] max-w-[400px] overflow-y-auto overscroll-contain border-0 border-l border-brand-100 bg-[#f8fbff] p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/35 backdrop:backdrop-blur-sm"
      >
        <div className="flex min-h-full flex-col px-6 pb-7 pt-6 sm:px-8 sm:pt-8">
          <div className="mb-12 flex items-center justify-between gap-3">
            <NavLink to="/" onClick={closeMenu} className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">
              <img src={logo} alt="" className="h-12 w-12 rounded-2xl object-contain shadow-sm" />
              <span>
                <span className="block text-xl font-bold tracking-tight text-slate-900">DevFlow</span>
                {/*<span className="mt-0.5 block text-xs text-slate-500">Your daily workspace</span>*/}
              </span>
            </NavLink>
            <button autoFocus type="button" onClick={closeMenu} aria-label="Close navigation menu" className="rounded-full p-2.5 text-slate-500 transition hover:bg-brand-100 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
              <Icon name="close" />
            </button>
          </div>

          {/*<h2 id="navigation-menu-title" className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</h2>*/}
          <nav aria-label="Menu navigation" className="overflow-hidden rounded-2xl border border-brand-100 bg-brand-50/70">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={closeMenu}
                className={({ isActive }) => `group flex items-center gap-3.5 border-b border-brand-100 px-4 py-4 transition last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 ${isActive ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-brand-100 text-brand-700 shadow-sm shadow-brand-200" : "bg-white/80 text-brand-500"}`}>
                      <Icon name={link.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{link.label}</span>
                      <span className={`mt-0.5 block text-xs ${isActive ? "text-brand-700" : "text-slate-500"}`}>{link.description}</span>
                    </span>
                    <Icon name="arrow" className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-600" : "text-slate-300 group-hover:text-brand-500"}`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 divide-y divide-slate-200/70 border-y border-slate-200/70">
            <div className="flex items-center gap-3 py-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold uppercase text-amber-800">
                {user?.name?.trim().charAt(0) || "U"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.name || "Your account"}</p>
                <p className="mt-0.5 break-all text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <Icon name="bell" />
                <span className="flex-1">Desktop alerts</span>
                {desktopPermission === "default" ? (
                  <button type="button" onClick={() => { void enableDesktopAlerts(); }} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">Enable</button>
                ) : desktopPermission === "granted" ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={desktopAlertsEnabled}
                    onClick={() => setDesktopAlertsEnabled(!desktopAlertsEnabled)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      desktopAlertsEnabled
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {desktopAlertsEnabled ? "Enabled" : "Disabled"}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">{desktopPermission === "denied" ? "Blocked" : "Unavailable"}</span>
                )}
              </div>
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={() => logout.mutate(undefined, { onSuccess: closeMenu })}
                disabled={logout.isPending}
                className="flex w-full items-center gap-3 rounded-lg py-4 text-left text-sm font-medium text-slate-600 transition hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-wait disabled:opacity-60"
              >
                <Icon name="logout" />
                {logout.isPending ? "Logging out..." : "Log out"}
              </button>
              {logout.isError && <p role="alert" className="mb-3 text-xs text-rose-600">Could not log out. Please try again.</p>}
            </div>
          </div>

          <footer className="mt-auto pt-12 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} DevFlow</p>
            <p className="mt-1.5">A little progress, every day.</p>
          </footer>
        </div>
      </dialog>
    </>
  );
}
