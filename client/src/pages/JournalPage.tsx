import { useMemo, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import Journal from "../components/Journal";
import { useJournalEntries } from "../hooks/useJournal";
import { JournalEntry } from "../types";
import { getCalendarDays, getDateKey } from "../utils/journalCalendar";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const navigationClass = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500";

export default function JournalPage() {
  const { data: entries = [], isLoading, isError, refetch } = useJournalEntries();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [jumpYear, setJumpYear] = useState(() => new Date().getFullYear());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const todayKey = getDateKey(new Date());
  const selectedKey = getDateKey(selectedDate);
  const days = getCalendarDays(visibleMonth);

  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, JournalEntry[]>();
    entries.forEach((entry) => {
      const key = getDateKey(new Date(entry.date));
      const dayEntries = grouped.get(key) ?? [];
      dayEntries.push(entry);
      grouped.set(key, dayEntries);
    });
    return grouped;
  }, [entries]);

  function selectDate(date: Date) {
    setSelectedDate(date);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setJumpYear(date.getFullYear());
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToToday() {
    const today = new Date();
    setSelectedDate(today);
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setJumpYear(today.getFullYear());
  }

  function goToMonth(month: Date) {
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    setVisibleMonth(month);
    setJumpYear(month.getFullYear());
    setSelectedDate(new Date(month.getFullYear(), month.getMonth(), Math.min(selectedDate.getDate(), lastDay), 12));
  }

  function changeMonth(offset: number) {
    goToMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1));
  }

  function handleMonthChange(month: number) {
    goToMonth(new Date(jumpYear, month, 1));
  }

  function handleYearChange(year: number) {
    setJumpYear(year);
    if (Number.isInteger(year) && year >= 1900 && year <= 9999) {
      goToMonth(new Date(year, visibleMonth.getMonth(), 1));
    }
  }

  function addEntry() {
    setIsFormOpen(true);
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <AppHeader />

      <section aria-labelledby="journal-heading" className="surface mb-5 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            {/*<p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">workspace</p>*/}
            <h1 id="journal-heading" className="text-2xl font-bold tracking-tight text-slate-900">Dev journal</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isLoading ? "Loading your journals..." : isError ? "Your journals could not be loaded." : "Select a date to write or read your journals."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={addEntry} className="button-primary px-4 py-2.5 text-sm">Add journal</button>
            <button type="button" onClick={goToToday} className={navigationClass}>Today</button>
            <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className={navigationClass}>
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className={navigationClass}>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="journal-month-heading" aria-live="polite" className="text-sm font-semibold text-slate-600">
            {visibleMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </h2>
          <div aria-label="Jump to month and year" className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Jump to</span>
            <label>
              <span className="sr-only">Month</span>
              <select value={visibleMonth.getMonth()} onChange={(event) => handleMonthChange(Number(event.target.value))} className="field px-2 py-2 text-sm">
                {months.map((month, index) => <option key={month} value={index}>{month}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Year</span>
              <input value={jumpYear} onChange={(event) => handleYearChange(Number(event.target.value))} type="number" min={1900} max={9999} step={1} required className="field w-24 px-2 py-2 text-sm" />
            </label>
          </div>
        </div>
        <table aria-labelledby="journal-month-heading" className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              {weekdays.map((day) => (
                <th key={day} scope="col" className="border border-stone-200 bg-stone-50 px-0.5 py-3 text-center text-[10px] font-semibold uppercase text-slate-500 sm:text-xs">
                  <span className="hidden md:inline">{day}</span>
                  <span className="md:hidden"><abbr title={day} className="no-underline">{day.slice(0, 3)}</abbr></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: days.length / 7 }, (_, week) => (
              <tr key={week}>
                {days.slice(week * 7, week * 7 + 7).map((day) => {
                  const key = getDateKey(day);
                  const dayEntries = entriesByDate.get(key) ?? [];
                  const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                  const isToday = key === todayKey;
                  const isSelected = key === selectedKey;

                  return (
                    <td key={key} className="border border-stone-200 p-0 align-top">
                      <button
                        type="button"
                        onClick={() => selectDate(day)}
                        aria-pressed={isSelected}
                        aria-current={isToday ? "date" : undefined}
                        aria-label={`${day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, ${isLoading || isError ? "journals unavailable" : dayEntries.length > 0 ? "has journals" : "no journals"}`}
                        className={`relative flex h-20 w-full flex-col items-start overflow-hidden p-1.5 text-left transition focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 sm:h-24 sm:p-2.5 lg:h-28 ${
                          isSelected ? "bg-brand-50 ring-2 ring-inset ring-brand-400" : isToday ? "bg-amber-50 hover:bg-amber-100/70" : !isCurrentMonth ? "bg-stone-50/70 hover:bg-stone-100" : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "bg-amber-300 text-amber-950" : isCurrentMonth ? "text-slate-700" : "text-slate-400"}`}>
                          {day.getDate()}
                        </span>
                        {dayEntries.length > 0 && (
                          <>
                            <span aria-hidden="true" className="ml-2 mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                            <span className="mt-1 hidden w-full truncate text-xs text-slate-500 sm:block">{dayEntries[0].content}</span>
                          </>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-300" />Today</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-400" />Has journals</span>
        </div>
      </section>

      <div ref={detailsRef} className="scroll-mt-6">
        <Journal
          date={selectedDate}
          entries={entriesByDate.get(selectedKey) ?? []}
          isLoading={isLoading}
          isError={isError}
          isFormOpen={isFormOpen}
          onAddEntry={addEntry}
          onCloseForm={() => setIsFormOpen(false)}
          onRetry={() => { void refetch(); }}
        />
      </div>
    </main>
  );
}
