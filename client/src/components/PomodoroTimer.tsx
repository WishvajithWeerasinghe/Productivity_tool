import { FormEvent, useState } from "react";
import { useFocusSession } from "../contexts/FocusSessionContext";

export default function PomodoroTimer() {
  const { durationMinutes, secondsLeft, running, saveError, start, pause, reset, setDuration } = useFocusSession();
  const [durationInput, setDurationInput] = useState(String(durationMinutes));

  function applyDuration(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextDuration = Number(durationInput);
    if (running || !Number.isInteger(nextDuration) || nextDuration < 1 || nextDuration > 180) return;

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
          <h2 className="font-bold text-slate-800">Focus session</h2>
          <p className="mt-1 text-xs text-slate-500">A little uninterrupted time</p>
        </div>
      </div>
      <div
        className="mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-full p-2"
        style={{ background: `conic-gradient(#7764e8 ${progress}%, #eceaf8 ${progress}%)` }}
        role="timer"
        aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
          <p className="font-mono text-4xl font-semibold tracking-tight text-slate-800">
            {minutes}:{seconds}
          </p>
        </div>
      </div>
      <p className="mb-4 text-center text-xs text-slate-400">{running ? "Stay in the zone" : "Ready when you are"}</p>
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
      <form onSubmit={applyDuration} className="mt-5 border-t border-slate-100 pt-4">
        <fieldset disabled={running}>
          <legend className="mb-3 text-sm font-semibold text-slate-700">Time settings</legend>
          <label htmlFor="focus-session-duration" className="mb-2 block text-xs font-medium text-slate-500">
            Session duration (minutes)
          </label>
          <div className="flex gap-2">
            <input
              id="focus-session-duration"
              type="number"
              min={1}
              max={180}
              step={1}
              required
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              aria-describedby="focus-session-duration-help"
              className="field min-w-0 flex-1 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />
            <button type="submit" className="button-primary shrink-0 px-4 py-2 text-sm">Set time</button>
          </div>
        </fieldset>
        <p id="focus-session-duration-help" className="mt-2 text-xs leading-5 text-slate-400">
          {running ? "Pause the session to change its duration." : "Choose 1–180 minutes. Setting a time resets the session."}
        </p>
      </form>
    </section>
  );
}
