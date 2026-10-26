import { FormEvent, useState } from "react";
import AppHeader from "../components/AppHeader";
import MeetingTimeEditor from "../components/MeetingTimeEditor";
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
  "field mt-1 w-full px-3 py-2.5 text-sm";

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
  const [meetingTime, setMeetingTime] = useState("");
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
    setMeetingTime("");
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
        meetingTime,
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
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <AppHeader />

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-6 sm:px-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Workspace
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meeting notes</h1>
              <p className="mt-1 text-sm text-slate-500">
                Keep decisions, attendees, and follow-ups in one place.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen((open) => !open)}
              className="button-primary inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-sm"
            >
              <span aria-hidden="true" className="text-lg leading-none">+</span>
              {isFormOpen ? "Close form" : "Add meeting notes"}
            </button>
          </div>

          {isFormOpen && (
            <form
              onSubmit={handleSubmit}
              className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
            >
              <div className="mb-4">
                <h2 className="font-semibold text-slate-900">New meeting</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Set the meeting date and time for a reminder 10 minutes before it starts. Times use your device's local timezone.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm font-medium text-slate-700">
                  Meeting name <span className="text-rose-500">*</span>
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
                <label className="text-sm font-medium text-slate-700">
                  Meeting date <span className="text-rose-500">*</span>
                  <input
                    required
                    type="date"
                    value={meetingDate}
                    onChange={(event) => setMeetingDate(event.target.value)}
                    className={inputClassName}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Meeting time <span className="text-rose-500">*</span>
                  <input
                    required
                    type="time"
                    value={meetingTime}
                    onChange={(event) => setMeetingTime(event.target.value)}
                    className={inputClassName}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
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
                <label className="text-sm font-medium text-slate-700">
                  Department
                  <input
                    maxLength={80}
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    placeholder="e.g. Engineering"
                    className={inputClassName}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Participants
                  <input
                    value={participants}
                    onChange={(event) => setParticipants(event.target.value)}
                    placeholder="Separate names with commas"
                    className={inputClassName}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">
                  Notes <span className="text-rose-500">*</span>
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
                <p role="alert" className="mt-3 text-sm text-rose-600">
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
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createNote.isPending}
                  className="button-primary px-4 py-2 text-sm disabled:cursor-not-allowed"
                >
                  {createNote.isPending ? "Saving…" : "Save meeting"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-lg bg-violet-50 px-3 py-1.5 font-semibold text-violet-700">
              Table
            </span>
            <span className="px-2 text-slate-500">
              {notes.length} {notes.length === 1 ? "meeting" : "meetings"}
            </span>
          </div>
          <label className="relative block sm:w-72">
            <span className="sr-only">Search meeting notes</span>
            <span aria-hidden="true" className="absolute left-3 top-2.5 text-slate-400">
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search meetings…"
              className="field w-full py-2 pl-9 pr-3 text-sm"
            />
          </label>
        </div>

        {isLoading ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            Loading meeting notes…
          </p>
        ) : isError ? (
          <p role="alert" className="px-6 py-12 text-center text-sm text-rose-600">
            Could not load meeting notes. Please refresh and try again.
          </p>
        ) : filteredNotes.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-semibold text-slate-800">
              {search ? "No meetings match your search" : "No meeting notes yet"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try another name, department, meeting type, or participant."
                : "Create your first meeting note to keep the important details together."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
              <tbody className="divide-y divide-slate-100">
                {filteredNotes.map((note) => (
                  <tr key={note._id} className="align-top transition hover:bg-violet-50/40">
                    <td className="max-w-64 px-5 py-4 font-semibold text-slate-800 sm:px-7">
                      {note.title}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatDate(note.meetingDate)}
                      <MeetingTimeEditor meeting={note} />
                    </td>
                    <td className="px-4 py-4">
                      {note.department ? (
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                          {note.department}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="max-w-56 px-4 py-4 text-slate-600">
                      {note.participants.length
                        ? note.participants.join(", ")
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
                        {note.meetingType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {user?.name ?? "You"}
                    </td>
                    <td className="max-w-72 px-5 py-4 text-slate-500 sm:px-7">
                      <details className="group">
                        <summary className="cursor-pointer list-none font-medium text-violet-700 hover:text-violet-900">
                          View notes
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
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
