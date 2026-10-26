import { Schema, model, Document, Types } from "mongoose";

export interface IMeetingNote extends Document {
  user: Types.ObjectId;
  title: string;
  meetingDate: string;
  meetingTime: string;
  department: string;
  participants: string[];
  meetingType: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const meetingNoteSchema = new Schema<IMeetingNote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    meetingDate: { type: String, required: true },
    meetingTime: { type: String, default: "", validate: (value: string) => value === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value) },
    department: { type: String, trim: true, maxlength: 80, default: "" },
    participants: { type: [String], default: [] },
    meetingType: { type: String, required: true, trim: true, maxlength: 60 },
    notes: { type: String, required: true, trim: true, maxlength: 10000 },
  },
  { timestamps: true }
);

meetingNoteSchema.index({ user: 1, meetingDate: -1, createdAt: -1 });

export default model<IMeetingNote>("MeetingNote", meetingNoteSchema);
