import { Outlet } from "react-router-dom";
import { NotificationProvider } from "../contexts/NotificationContext";
import { FocusSessionProvider } from "../contexts/FocusSessionContext";
import { useCurrentUser } from "../hooks/useAuth";
import MeetingReminders from "./MeetingReminders";

export default function WorkspaceLayout() {
  const { data: user } = useCurrentUser();
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
