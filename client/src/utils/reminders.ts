import { MeetingNote } from "../types/meetingNotes";

const TEN_MINUTES = 10 * 60 * 1000;

export function getRemainingSeconds(deadline: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function getMeetingStart(meeting: Pick<MeetingNote, "meetingDate" | "meetingTime">): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meeting.meetingDate) || !meeting.meetingTime || !/^([01]\d|2[0-3]):[0-5]\d$/.test(meeting.meetingTime)) return null;
  const date = new Date(`${meeting.meetingDate}T${meeting.meetingTime}:00`);
  if (Number.isNaN(date.getTime())) return null;
  const [year, month, day] = meeting.meetingDate.split("-").map(Number);
  const [hours, minutes] = meeting.meetingTime.split(":").map(Number);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hours || date.getMinutes() !== minutes) return null;
  return date.getTime();
}

export function getDueMeetingReminders(meetings: MeetingNote[], now: number, delivered: ReadonlySet<string>) {
  return meetings.flatMap((meeting) => {
    const startsAt = getMeetingStart(meeting);
    const key = `${meeting._id}:${meeting.meetingDate}:${meeting.meetingTime}`;
    if (startsAt === null || now < startsAt - TEN_MINUTES || now >= startsAt || delivered.has(key)) return [];
    return [{ key, meeting, startsAt }];
  });
}
