import { FormEvent, useState } from "react";
import AppHeader from "../components/AppHeader";
import { useCurrentUser } from "../hooks/useAuth";
import { useCreateMeetingNote, useMeetingNotes } from "../hooks/useMeetingNotes";

const meetingTypes = [
  "Strategy Meeting",
  "Team Meeting",
  "Onboarding",
  "Sprint Retrospective",
  "Daily Standup",
  "Other",
];

const inputClassName =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MeetingNotes() {
  const { data: user } = useCurrentUser();
  const { data: notes = [], isLoading, isError } = useMeetingNotes();
  const createNote = useCreateMeetingNote();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(
    getTodayDate
  );
  const [department, setDepartment] = useState("");
  const [participants, setParticipants] = useState("");
  const [meetingType, setMeetingType] = useState(meetingTypes[0]);
  const [meetingContent, setMeetingContent] = useState("");

  const filteredNotes = notes.filter((note) =>
    [note.title, note.department, note.meetingType, ...note.participants]
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  function resetForm() {
    setTitle("");
    setMeetingDate(getTodayDate());
    setDepartment("");
    setParticipants("");
    setMeetingType(meetingTypes[0]);
    setMeetingContent("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createNote.mutate(
      {
        title: title.trim(),
        meetingDate,
        department: department.trim(),
        participants: participants
          .split(",")
          .map((participant) => participant.trim())
          .filter(Boolean),
        meetingType,
        notes: meetingContent.trim(),
      },
      {
        onSuccess: () => {
          resetForm();
          setIsFormOpen(false);
        },
      }
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <AppHeader />

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 px-5 py-6 sm:px-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
                Workspace
              </p>
              <h1 className="text-2xl font-semibold text-white">Meeting notes</h1>
              <p className="mt-1 text-sm text-slate-400">
                Keep decisions, attendees, and follow-ups in one place.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen((open) => !open)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <span aria-hidden="true" className="text-lg leading-none">+</span>
              {isFormOpen ? "Close form" : "Add meeting notes"}
            </button>
          </div>

          {isFormOpen && (
            <form
              onSubmit={handleSubmit}
              className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5"
            >
              <div className="mb-4">
                <h2 className="font-semibold text-white">New meeting</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add the meeting details and capture what was discussed.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm text-slate-300">
                  Meeting name <span className="text-rose-400">*</span>
                  <input
                    autoFocus
                    required
                    maxLength={120}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Product roadmap planning"
                    className={inputClassName}
                  />
                </label>
                <label className="text-sm text-slate-300">
                  Meeting date <span className="text-rose-400">*</span>
                  <input
                    required
                    type="date"
                    value={meetingDate}
                    onChange={(event) => setMeetingDate(event.target.value)}
                    className={inputClassName}
                  />
                </label>
                <label className="text-sm text-slate-300">
                  Meeting type
                  <select
                    value={meetingType}
                    onChange={(event) => setMeetingType(event.target.value)}
                    className={inputClassName}
                  >
                    {meetingTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-300">
                  Department
                  <input
                    maxLength={80}
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    placeholder="e.g. Engineering"
                    className={inputClassName}
                  />
                </label>
                <label className="text-sm text-slate-300 sm:col-span-2">
                  Participants
                  <input
                    value={participants}
                    onChange={(event) => setParticipants(event.target.value)}
                    placeholder="Separate names with commas"
                    className={inputClassName}
                  />
                </label>
                <label className="text-sm text-slate-300 sm:col-span-2 lg:col-span-3">
                  Notes <span className="text-rose-400">*</span>
                  <textarea
                    required
                    rows={5}
                    maxLength={10000}
                    value={meetingContent}
                    onChange={(event) => setMeetingContent(event.target.value)}
                    placeholder="Capture the discussion, decisions, and action items…"
                    className={`${inputClassName} resize-y`}
                  />
                </label>
              </div>
              {createNote.isError && (
                <p role="alert" className="mt-3 text-sm text-rose-400">
                  Could not save the meeting notes. Please try again.
                </p>
              )}
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsFormOpen(false);
                    createNote.reset();
                  }}
                  className="rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createNote.isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createNote.isPending ? "Saving…" : "Save meeting"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-md bg-slate-800 px-3 py-1.5 font-medium text-white">
              Table
            </span>
            <span className="px-2 text-slate-500">
              {notes.length} {notes.length === 1 ? "meeting" : "meetings"}
            </span>
          </div>
          <label className="relative block sm:w-72">
            <span className="sr-only">Search meeting notes</span>
            <span aria-hidden="true" className="absolute left-3 top-2.5 text-slate-500">
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search meetings…"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-indigo-500"
            />
          </label>
        </div>

        {isLoading ? (
          <p className="px-6 py-12 text-center text-sm text-slate-400">
            Loading meeting notes…
          </p>
        ) : isError ? (
          <p role="alert" className="px-6 py-12 text-center text-sm text-rose-400">
            Could not load meeting notes. Please refresh and try again.
          </p>
        ) : filteredNotes.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-medium text-slate-200">
              {search ? "No meetings match your search" : "No meeting notes yet"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {search
                ? "Try another name, department, meeting type, or participant."
                : "Create your first meeting note to keep the important details together."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium sm:px-7">Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Meeting date</th>
                  <th scope="col" className="px-4 py-3 font-medium">Department</th>
                  <th scope="col" className="px-4 py-3 font-medium">Participants</th>
                  <th scope="col" className="px-4 py-3 font-medium">Meeting type</th>
                  <th scope="col" className="px-4 py-3 font-medium">Created</th>
                  <th scope="col" className="px-4 py-3 font-medium">Created by</th>
                  <th scope="col" className="px-5 py-3 font-medium sm:px-7">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredNotes.map((note) => (
                  <tr key={note._id} className="align-top transition hover:bg-slate-800/30">
                    <td className="max-w-64 px-5 py-4 font-medium text-slate-200 sm:px-7">
                      {note.title}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                      {formatDate(note.meetingDate)}
                    </td>
                    <td className="px-4 py-4">
                      {note.department ? (
                        <span className="rounded-md bg-amber-400/10 px-2 py-1 text-xs text-amber-200">
                          {note.department}
                        </span>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="max-w-56 px-4 py-4 text-slate-300">
                      {note.participants.length
                        ? note.participants.join(", ")
                        : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap rounded-md bg-rose-400/10 px-2 py-1 text-xs text-rose-200">
                        {note.meetingType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                      {user?.name ?? "You"}
                    </td>
                    <td className="max-w-72 px-5 py-4 text-slate-400 sm:px-7">
                      <details className="group">
                        <summary className="cursor-pointer list-none text-indigo-300 hover:text-indigo-200">
                          View notes
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-300">
                          {note.notes}
                        </p>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
