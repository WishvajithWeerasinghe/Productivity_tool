import { useEffect, useRef } from "react";
import { useMeetingNotes } from "../hooks/useMeetingNotes";
import { useNotifications } from "../contexts/NotificationContext";
import { getDueMeetingReminders } from "../utils/reminders";

function readDelivered(storageKey: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value) ? value.filter((key): key is string => typeof key === "string") : [];
  } catch {
    return [];
  }
}

export default function MeetingReminders({ userId }: { userId: string }) {
  const { data: meetings = [] } = useMeetingNotes();
  const { notify } = useNotifications();
  const storageKey = `devflow:meeting-reminders:${userId}`;
  const delivered = useRef(new Set(readDelivered(storageKey)));

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      for (const reminder of getDueMeetingReminders(meetings, now, delivered.current)) {
        // Recheck storage so another open tab can mark an alert as delivered.
        const saved = readDelivered(storageKey);
        if (saved.includes(reminder.key)) { delivered.current.add(reminder.key); continue; }
        delivered.current.add(reminder.key);
        try {
          localStorage.setItem(storageKey, JSON.stringify([...new Set([...saved, ...delivered.current])].slice(-200)));
        } catch {
          // The in-memory set still prevents repeated alerts during this visit.
        }
        const minutes = Math.max(1, Math.ceil((reminder.startsAt - now) / 60000));
        const time = new Date(reminder.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        notify({
          id: `meeting:${reminder.key}`,
          title: "Meeting coming up",
          message: `${reminder.meeting.title} starts in ${minutes} ${minutes === 1 ? "minute" : "minutes"}, at ${time}.`,
          href: "/meeting-notes",
        });
      }
    };
    check();
    const interval = setInterval(check, 1000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [meetings, storageKey, notify]);

  return null;
}
