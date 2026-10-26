import { FormEvent, useEffect, useState } from "react";
import { CreateMeetingNote, MeetingNote } from "../types/meetingNotes";

const meetingTypes = [
  "Strategy Meeting",
  "Team Meeting",
  "Onboarding",
  "Sprint Retrospective",
  "Daily Standup",
  "Other",
];

const inputClassName = "field mt-1 w-full px-3 py-2.5 text-sm";

interface MeetingNoteModalProps {
  meeting: MeetingNote;
  onClose: () => void;
  onSave: (payload: CreateMeetingNote) => void;
  onDelete: () => void;
  saving: boolean;
  deleting: boolean;
  error: boolean;
}

export default function MeetingNoteModal({
  meeting,
  onClose,
  onSave,
  onDelete,
  saving,
  deleting,
  error,
}: MeetingNoteModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(meeting.title);
  const [meetingDate, setMeetingDate] = useState(meeting.meetingDate);
  const [meetingTime, setMeetingTime] = useState(meeting.meetingTime ?? "");
  const [meetingLink, setMeetingLink] = useState(meeting.meetingLink);
  const [meetingType, setMeetingType] = useState(meeting.meetingType);
  const [notes, setNotes] = useState(meeting.notes);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      title: title.trim(),
      meetingDate,
      meetingTime,
      meetingLink: meetingLink.trim(),
      meetingType,
      notes: notes.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-details-title"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="surface max-h-[90vh] w-full max-w-2xl overflow-y-auto border-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Meeting details</p>
            <h2 id="meeting-details-title" className="mt-1 text-lg font-bold text-slate-900">
              {isEditing ? "Edit meeting" : meeting.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close meeting details"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Meeting name <span className="text-rose-500">*</span>
            <input required readOnly={!isEditing} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} className={`${inputClassName} ${!isEditing ? "cursor-default bg-white" : ""}`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Meeting type
            <select disabled={!isEditing} value={meetingType} onChange={(event) => setMeetingType(event.target.value)} className={inputClassName}>
              {meetingTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Meeting date <span className="text-rose-500">*</span>
            <input required readOnly={!isEditing} type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} className={inputClassName} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Meeting time <span className="text-rose-500">*</span>
            <input required readOnly={!isEditing} type="time" value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} className={inputClassName} />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Meeting link
            <input readOnly={!isEditing} type="url" value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} placeholder="https://meet.google.com/..." className={inputClassName} />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Notes <span className="text-rose-500">*</span>
            <textarea required readOnly={!isEditing} rows={7} maxLength={10000} value={notes} onChange={(event) => setNotes(event.target.value)} className={`${inputClassName} resize-y`} />
          </label>
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-rose-600">Could not save or delete this meeting. Please try again.</p>}

        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={onDelete} disabled={saving || deleting} className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
            {deleting ? "Deleting…" : "Delete meeting"}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
              Close
            </button>
            {isEditing ? (
              <>
                <button type="button" onClick={() => setIsEditing(false)} disabled={saving || deleting} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                  Cancel edit
                </button>
                <button type="submit" disabled={saving || deleting} className="button-primary px-4 py-2 text-sm disabled:cursor-not-allowed">
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="button-primary px-4 py-2 text-sm">
                Edit meeting
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
