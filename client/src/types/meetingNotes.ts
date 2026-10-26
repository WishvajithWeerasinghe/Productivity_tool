export interface MeetingNote {
  _id: string;
  title: string;
  meetingDate: string;
  meetingTime?: string;
  meetingLink: string;
  meetingType: string;
  notes: string;
  createdAt: string;
}

export type CreateMeetingNote = Omit<MeetingNote, "_id" | "createdAt">;
