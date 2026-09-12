import { Response } from "express";
import JournalEntry from "../models/JournalEntry";
import { AuthRequest } from "../middleware/auth";

export async function getEntries(req: AuthRequest, res: Response) {
  const entries = await JournalEntry.find({ user: req.userId }).sort({ date: -1 });
  res.json({ entries });
}

export async function createEntry(req: AuthRequest, res: Response) {
  const { date, content, linkedTasks } = req.body;

  if (!content) {
    return res.status(400).json({ message: "content is required" });
  }

  const entry = await JournalEntry.create({
    user: req.userId,
    date: date || new Date(),
    content,
    linkedTasks,
  });

  res.status(201).json({ entry });
}

export async function updateEntry(req: AuthRequest, res: Response) {
  const entry = await JournalEntry.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!entry) return res.status(404).json({ message: "Entry not found" });
  res.json({ entry });
}

export async function deleteEntry(req: AuthRequest, res: Response) {
  const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  res.json({ message: "Entry deleted" });
}
