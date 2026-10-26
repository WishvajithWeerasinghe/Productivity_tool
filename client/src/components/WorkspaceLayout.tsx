import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { NotificationProvider } from "../contexts/NotificationContext";
import { FocusSessionProvider } from "../contexts/FocusSessionContext";
import { useCurrentUser } from "../hooks/useAuth";
import MeetingReminders from "./MeetingReminders";

export default function WorkspaceLayout() {
  const { data: user } = useCurrentUser();
  useEffect(() => {
    function applyAppearance() {
      const image = window.localStorage.getItem("workspace-background-image");
      const overlay = window.localStorage.getItem("workspace-background-overlay") !== "false";
      document.body.classList.toggle("workspace-background", Boolean(image));
      document.body.style.backgroundImage = image
        ? `${overlay ? "linear-gradient(rgba(248, 251, 255, 0.78), rgba(248, 251, 255, 0.78)), " : ""}url("${image}")`
        : "";
      document.body.style.backgroundSize = image ? "cover" : "";
      document.body.style.backgroundAttachment = image ? "fixed" : "";
      document.body.style.backgroundPosition = image ? "center" : "";
    }
    applyAppearance();
    window.addEventListener("workspace-appearance-changed", applyAppearance);
    return () => {
      window.removeEventListener("workspace-appearance-changed", applyAppearance);
      document.body.classList.remove("workspace-background");
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.backgroundPosition = "";
    };
  }, []);
  if (!user) return null;

  return (
    <NotificationProvider key={user.id}>
      <FocusSessionProvider>
        <MeetingReminders userId={user.id} />
        <Outlet />
      </FocusSessionProvider>
    </NotificationProvider>
  );
}
