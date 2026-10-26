import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { getRemainingSeconds } from "../utils/reminders";
import { useNotifications } from "./NotificationContext";

interface FocusSessionContextValue {
  durationMinutes: number;
  secondsLeft: number;
  running: boolean;
  saveError: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setDuration: (minutes: number) => void;
}

const FocusSessionContext = createContext<FocusSessionContextValue | null>(null);

export function FocusSessionProvider({ children }: { children: ReactNode }) {
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const startTimeRef = useRef<Date | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const sessionVersion = useRef(0);
  const { notify } = useNotifications();

  const complete = useCallback(() => {
    const startTime = startTimeRef.current;
    if (!startTime) return;
    const version = sessionVersion.current;
    startTimeRef.current = null;
    deadlineRef.current = null;
    setRunning(false);
    setSecondsLeft(durationMinutes * 60);
    notify({
      id: `focus:${startTime.getTime()}:${version}`,
      title: "Focus session complete",
      message: `You finished your ${durationMinutes}-minute focus session. Time for a break!`,
      href: "/",
    });
    void api.post("/pomodoro", { startTime, durationMinutes, completed: true }).catch(() => {
      if (sessionVersion.current === version) setSaveError(true);
    });
  }, [durationMinutes, notify]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (deadlineRef.current === null) return;
      const remaining = getRemainingSeconds(deadlineRef.current);
      if (remaining === 0) complete();
      else setSecondsLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [running, complete]);

  function start() {
    if (running) return;
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
      sessionVersion.current += 1;
    }
    deadlineRef.current = Date.now() + secondsLeft * 1000;
    setSaveError(false);
    setRunning(true);
  }

  function pause() {
    if (deadlineRef.current === null) return;
    const remaining = getRemainingSeconds(deadlineRef.current);
    if (remaining === 0) { complete(); return; }
    setSecondsLeft(remaining);
    deadlineRef.current = null;
    setRunning(false);
  }

  function reset() {
    sessionVersion.current += 1;
    startTimeRef.current = null;
    deadlineRef.current = null;
    setRunning(false);
    setSecondsLeft(durationMinutes * 60);
    setSaveError(false);
  }

  function setDuration(minutes: number) {
    if (running || !Number.isInteger(minutes) || minutes < 1 || minutes > 180) return;
    reset();
    setDurationMinutes(minutes);
    setSecondsLeft(minutes * 60);
  }

  return (
    <FocusSessionContext.Provider value={{ durationMinutes, secondsLeft, running, saveError, start, pause, reset, setDuration }}>
      {children}
    </FocusSessionContext.Provider>
  );
}

export function useFocusSession() {
  const context = useContext(FocusSessionContext);
  if (!context) throw new Error("useFocusSession must be used within FocusSessionProvider");
  return context;
}
