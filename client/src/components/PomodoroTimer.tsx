import { useEffect, useState } from "react";
import { useFocusSession } from "../contexts/FocusSessionContext";

export default function PomodoroTimer() {
  const { durationMinutes, secondsLeft, running, durationLocked, saveError, start, pause, reset, setDuration } = useFocusSession();
  const [durationInput, setDurationInput] = useState(String(durationMinutes));

  useEffect(() => {
    setDurationInput(String(durationMinutes));
  }, [durationMinutes]);

  function applyDuration() {
    const nextDuration = Number(durationInput);
    if (durationLocked || !Number.isInteger(nextDuration) || nextDuration < 1 || nextDuration > 180) {
      setDurationInput(String(durationMinutes));
      return;
    }

    setDuration(nextDuration);
    setDurationInput(String(nextDuration));
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const progress = ((durationMinutes * 60 - secondsLeft) / (durationMinutes * 60)) * 100;

  return (
    <section className="surface p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="font-bold text-slate-800">Focus Timer</h2>
        </div>
      </div>
      <div
        className="mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-full p-2"
        style={{ background: `conic-gradient(#7764e8 ${progress}%, #eceaf8 ${progress}%)` }}
        role="timer"
        aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
          {durationLocked ? (
            <p className="font-mono text-4xl font-semibold tracking-tight text-slate-800">
              {minutes}:{seconds}
            </p>
          ) : (
            <input
              autoFocus
              aria-label="Session duration in minutes"
              type="number"
              min={1}
              max={180}
              step={1}
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              onBlur={applyDuration}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyDuration();
                  start();
                }
              }}
              className="w-24 border-0 bg-transparent text-center font-mono text-4xl font-semibold tracking-tight text-slate-800 outline-none"
            />
          )}
        </div>
      </div>
      <p className="mb-4 text-center text-xs text-slate-400">{running ? "Running" : "Not Started"}</p>
      <div className="flex justify-center gap-2">
        {!running ? (
          <button onClick={start} className="button-primary min-w-28 px-5 py-2.5 text-sm">
            {secondsLeft < durationMinutes * 60 ? "Resume" : "Start"}
          </button>
        ) : (
          <button onClick={pause} className="min-w-28 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
            Pause
          </button>
        )}
        <button type="button" onClick={reset} className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          Reset
        </button>
      </div>
      {saveError && <p role="alert" className="mt-3 text-center text-xs text-rose-600">Session finished, but could not be saved.</p>}
    </section>
  );
}
