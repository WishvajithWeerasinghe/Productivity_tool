export interface User {
  id: string;
  name: string;
  email: string;
}

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  order: number;
  createdAt: string;
}

export interface JournalEntry {
  _id: string;
  date: string;
  content: string;
  linkedTasks: string[];
}
