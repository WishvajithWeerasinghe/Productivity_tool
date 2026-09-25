import { Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/auth";

export async function getTasks(req: AuthRequest, res: Response) {
  const tasks = await Task.find({ user: req.userId }).sort({ status: 1, order: 1 });
  res.json({ tasks });
}

export async function createTask(req: AuthRequest, res: Response) {
  const { title, description, status, priority, tags } = req.body;

  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }

  const targetStatus = status || "todo";
  // New tasks go to the bottom of their column.
  const count = await Task.countDocuments({ user: req.userId, status: targetStatus });

  const task = await Task.create({
    user: req.userId,
    title,
    description,
    status: targetStatus,
    priority,
    tags,
    order: count,
  });

  res.status(201).json({ task });
}

export async function updateTask(req: AuthRequest, res: Response) {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ task });
}

export async function deleteTask(req: AuthRequest, res: Response) {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task deleted" });
}

/**
 * Bulk-updates status + order for a batch of tasks in one request.
 * Called after a drag-and-drop operation so the whole board's new
 * arrangement (possibly across multiple columns) is persisted atomically.
 */
export async function reorderTasks(req: AuthRequest, res: Response) {
  const { tasks } = req.body as {
    tasks: { id: string; status: string; order: number }[];
  };

  if (!Array.isArray(tasks)) {
    return res.status(400).json({ message: "tasks must be an array" });
  }

  await Promise.all(
    tasks.map((t) =>
      Task.updateOne(
        { _id: t.id, user: req.userId },
        { status: t.status, order: t.order }
      )
    )
  );

  const updated = await Task.find({ user: req.userId }).sort({ status: 1, order: 1 });
  res.json({ tasks: updated });
}
