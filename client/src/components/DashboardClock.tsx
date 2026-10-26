import { useEffect, useState } from "react";

export default function DashboardClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="surface shrink-0 px-5 py-4 sm:text-right">
      <time dateTime={now.toISOString()}>
        <span className="block text-xs font-medium text-slate-500">
          {now.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <span className="mt-1 block text-2xl font-semibold tabular-nums tracking-tight text-slate-800">
          {now.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </span>
      </time>
    </div>
  );
}
