import { Schema, model, Document, Types } from "mongoose";

export interface IPomodoroSession extends Document {
  user: Types.ObjectId;
  task?: Types.ObjectId;
  startTime: Date;
  durationMinutes: number;
  completed: boolean;
  createdAt: Date;
}

const pomodoroSchema = new Schema<IPomodoroSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    task: { type: Schema.Types.ObjectId, ref: "Task" },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, default: 25 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IPomodoroSession>("PomodoroSession", pomodoroSchema);
