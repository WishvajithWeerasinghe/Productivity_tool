import { Schema, model, Document, Types } from "mongoose";

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, status: 1, order: 1 });

export default model<ITask>("Task", taskSchema);
