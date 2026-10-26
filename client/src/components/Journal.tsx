import { FormEvent, useEffect, useRef, useState } from "react";
import { useCreateEntry } from "../hooks/useJournal";
import { JournalEntry } from "../types";
import { getDateKey, getJournalTimestamp } from "../utils/journalCalendar";

interface JournalProps {
  date: Date;
  entries: JournalEntry[];
  isLoading: boolean;
  isError: boolean;
  isFormOpen: boolean;
  onAddEntry: () => void;
  onCloseForm: () => void;
  onRetry: () => void;
}

export default function Journal({ date, entries, isLoading, isError, isFormOpen, onAddEntry, onCloseForm, onRetry }: JournalProps) {
  const createEntry = useCreateEntry();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [failedDate, setFailedDate] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dateKey = getDateKey(date);
  const content = drafts[dateKey] ?? "";

  useEffect(() => {
    if (isFormOpen) textareaRef.current?.focus();
  }, [isFormOpen, dateKey]);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() || createEntry.isPending) return;

    setFailedDate(null);
    createEntry.mutate(
      { content: content.trim(), date: getJournalTimestamp(date) },
      {
        onSuccess: () => setDrafts((current) => ({ ...current, [dateKey]: "" })),
        onError: () => setFailedDate(dateKey),
      }
    );
  }

  return (
    <section aria-labelledby="journal-day-heading" className="surface scroll-mt-6 p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="journal-day-heading" className="text-lg font-bold text-slate-800">
            {date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Your thoughts, progress, and reflections for the day.</p>
        </div>
        {!isFormOpen && (
          <button type="button" onClick={onAddEntry} className="button-primary px-4 py-2.5 text-sm">Add journal</button>
        )}
      </div>

      <div className={`grid gap-6 ${isFormOpen ? "lg:grid-cols-2" : ""}`}>
        <div className="min-w-0 space-y-3">
          {isLoading ? (
            <p role="status" className="py-8 text-center text-sm text-slate-500">Loading journals...</p>
          ) : isError ? (
            <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              <p>Could not load your journals.</p>
              <button type="button" onClick={onRetry} className="mt-2 font-semibold underline">Try again</button>
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
              <p className="font-semibold text-slate-700">No journals for this date</p>
              <p className="mt-2 text-sm text-slate-500">Add an entry to capture what happened that day.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <article key={entry._id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{entry.content}</p>
              </article>
            ))
          )}
        </div>

        {isFormOpen && (
          <form onSubmit={handleSave} className="min-w-0 rounded-xl border border-brand-100 bg-brand-50/30 p-5">
            <label htmlFor="journal-content" className="mb-3 block font-semibold text-slate-800">New journal entry</label>
            <textarea
              ref={textareaRef}
              id="journal-content"
              value={content}
              onChange={(event) => {
                const value = event.target.value;
                setDrafts((current) => ({ ...current, [dateKey]: value }));
              }}
              placeholder="What did you work on? Any wins, ideas, or blockers?"
              rows={7}
              required
              disabled={createEntry.isPending}
              className="field w-full resize-y px-3 py-3 text-sm leading-6 disabled:opacity-60"
            />
            <p className="mt-2 text-xs text-slate-500">This entry will be saved to the selected date above.</p>
            {failedDate === dateKey && (
              <p role="alert" className="mt-3 text-sm text-rose-600">Could not save your journal. Your text is still here; please try again.</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={onCloseForm} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Close</button>
              <button type="submit" disabled={!content.trim() || createEntry.isPending} className="button-primary px-4 py-2 text-sm">
                {createEntry.isPending ? "Saving..." : "Save journal"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
