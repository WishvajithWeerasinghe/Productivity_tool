import { FormEvent, useState } from "react";
import { useUpdateMeetingTime } from "../hooks/useMeetingNotes";
import { MeetingNote } from "../types/meetingNotes";

export default function MeetingTimeEditor({ meeting }: { meeting: MeetingNote }) {
  const [isEditing, setIsEditing] = useState(false);
  const [time, setTime] = useState(meeting.meetingTime ?? "");
  const updateTime = useUpdateMeetingTime();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!time || updateTime.isPending) return;
    updateTime.mutate({ id: meeting._id, meetingTime: time }, { onSuccess: () => setIsEditing(false) });
  }

  if (!isEditing) {
    return (
      <div className="mt-1 text-xs">
        <p className="text-slate-500">{meeting.meetingTime ? `${meeting.meetingTime} (local)` : "Time not set"}</p>
        <button type="button" aria-label={`${meeting.meetingTime ? "Change" : "Set"} time for ${meeting.title}`} onClick={() => { setTime(meeting.meetingTime ?? ""); updateTime.reset(); setIsEditing(true); }} className="mt-1 font-semibold text-brand-700 hover:text-brand-900">
          {meeting.meetingTime ? "Change time" : "Set time"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="mt-2 min-w-40 space-y-2">
      <label className="block text-xs text-slate-500">
        Meeting time (local)
        <input autoFocus required type="time" value={time} onChange={(event) => setTime(event.target.value)} disabled={updateTime.isPending} className="field mt-1 w-full px-2 py-1.5 text-sm" />
      </label>
      {updateTime.isError && <p role="alert" className="whitespace-normal text-xs text-rose-600">Could not save the time. Please try again.</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={!time || updateTime.isPending} className="button-primary px-2 py-1.5 text-xs">{updateTime.isPending ? "Saving..." : "Save"}</button>
        <button type="button" onClick={() => setIsEditing(false)} disabled={updateTime.isPending} className="px-2 py-1.5 text-xs text-slate-500">Cancel</button>
      </div>
    </form>
  );
}
