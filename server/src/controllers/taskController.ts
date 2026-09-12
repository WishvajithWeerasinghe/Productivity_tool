import { Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/auth";

export async function getTasks(req: AuthRequest, res: Response) {
  const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ tasks });
}

export async function createTask(req: AuthRequest, res: Response) {
  const { title, description, status, priority, tags } = req.body;

  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }

  const task = await Task.create({
    user: req.userId,
    title,
    description,
    status,
    priority,
    tags,
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
