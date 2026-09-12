import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";

const DEFAULT_MINUTES = 25;

export default function PomodoroTimer() {
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return DEFAULT_MINUTES * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function start() {
    startTimeRef.current = new Date();
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  async function handleComplete() {
    setRunning(false);
    if (startTimeRef.current) {
      await api.post("/pomodoro", {
        startTime: startTimeRef.current,
        durationMinutes: DEFAULT_MINUTES,
        completed: true,
      });
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="bg-slate-900 rounded-xl p-6 text-center">
      <p className="text-5xl font-mono mb-4">
        {minutes}:{seconds}
      </p>
      <div className="flex gap-2 justify-center">
        {!running ? (
          <button onClick={start} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500">
            Start
          </button>
        ) : (
          <button onClick={pause} className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600">
            Pause
          </button>
        )}
      </div>
    </div>
  );
}
