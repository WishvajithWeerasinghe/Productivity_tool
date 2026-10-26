import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

interface AppNotification {
  id: string;
  title: string;
  message: string;
  href: string;
}

type DesktopPermission = NotificationPermission | "unsupported";
interface NotificationContextValue {
  notify: (notification: AppNotification) => void;
  desktopPermission: DesktopPermission;
  enableDesktopAlerts: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function getDesktopPermission(): DesktopPermission {
  return typeof Notification !== "undefined" && window.isSecureContext ? Notification.permission : "unsupported";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [desktopPermission, setDesktopPermission] = useState(getDesktopPermission);
  const desktopNotifications = useRef(new Map<string, Notification>());
  const navigate = useNavigate();

  useEffect(() => {
    const syncPermission = () => setDesktopPermission(getDesktopPermission());
    window.addEventListener("focus", syncPermission);
    const current = desktopNotifications.current;
    return () => {
      window.removeEventListener("focus", syncPermission);
      current.forEach((notification) => notification.close());
      current.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
    desktopNotifications.current.get(id)?.close();
    desktopNotifications.current.delete(id);
  }, []);

  const notify = useCallback((notification: AppNotification) => {
    setNotifications((current) => current.some((item) => item.id === notification.id) ? current : [...current, notification]);
    if (getDesktopPermission() !== "granted" || document.visibilityState === "visible") return;
    try {
      const desktop = new Notification(notification.title, { body: notification.message, tag: notification.id, icon: logo });
      desktopNotifications.current.set(notification.id, desktop);
      desktop.onclose = () => desktopNotifications.current.delete(notification.id);
      desktop.onclick = () => {
        window.focus();
        navigate(notification.href);
        dismiss(notification.id);
      };
    } catch {
      // The in-app popup remains available if system notifications are unsupported.
    }
  }, [navigate, dismiss]);

  async function enableDesktopAlerts() {
    if (getDesktopPermission() !== "default") return;
    try {
      setDesktopPermission(await Notification.requestPermission());
    } catch {
      setDesktopPermission("unsupported");
    }
  }

  return (
    <NotificationContext.Provider value={{ notify, desktopPermission, enableDesktopAlerts }}>
      {children}
      <div aria-label="Notifications" className="pointer-events-none fixed bottom-4 right-4 z-[70] flex max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-sm flex-col gap-3 overflow-y-auto">
        {notifications.map((notification) => (
          <article key={notification.id} role="alert" className="pointer-events-auto rounded-2xl border border-violet-200 bg-white p-5 shadow-xl shadow-slate-900/10">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg>
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-slate-900">{notification.title}</h2>
                <p className="mt-1 break-words text-sm leading-6 text-slate-600">{notification.message}</p>
                <Link to={notification.href} onClick={() => dismiss(notification.id)} className="mt-3 inline-block text-sm font-semibold text-violet-700 hover:text-violet-900">View details</Link>
              </div>
              <button type="button" onClick={() => dismiss(notification.id)} aria-label={`Dismiss ${notification.title}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="m6 6 12 12M6 18 18 6" /></svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
