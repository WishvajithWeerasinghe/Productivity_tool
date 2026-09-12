import { Schema, model, Document, Types } from "mongoose";

export interface IJournalEntry extends Document {
  user: Types.ObjectId;
  date: Date;
  content: string;
  linkedTasks: Types.ObjectId[];
  createdAt: Date;
}

const journalSchema = new Schema<IJournalEntry>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    content: { type: String, required: true },
    linkedTasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

export default model<IJournalEntry>("JournalEntry", journalSchema);
