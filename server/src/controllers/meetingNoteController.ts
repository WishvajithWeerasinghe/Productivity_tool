import { Response } from "express";
import MeetingNote from "../models/MeetingNote";
import { AuthRequest } from "../middleware/auth";

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidMeetingLink(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function getMeetingNotes(req: AuthRequest, res: Response) {
  const notes = await MeetingNote.find({ user: req.userId }).sort({
    meetingDate: -1,
    createdAt: -1,
  });
  res.json({ notes });
}

export async function createMeetingNote(req: AuthRequest, res: Response) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ message: "A meeting note object is required" });
  }

  const { title, meetingDate, meetingTime, meetingLink, meetingType, notes } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "title is required" });
  }
  if (!isValidDate(meetingDate)) {
    return res.status(400).json({ message: "meetingDate must be a valid YYYY-MM-DD date" });
  }
  if (meetingTime !== undefined && meetingTime !== "" && (typeof meetingTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(meetingTime))) {
    return res.status(400).json({ message: "meetingTime must be a valid HH:mm time" });
  }
  if (meetingLink !== undefined && meetingLink !== "" && !isValidMeetingLink(meetingLink)) {
    return res.status(400).json({ message: "meetingLink must be a valid HTTP(S) URL" });
  }
  if (typeof meetingType !== "string" || !meetingType.trim()) {
    return res.status(400).json({ message: "meetingType is required" });
  }
  if (typeof notes !== "string" || !notes.trim()) {
    return res.status(400).json({ message: "notes are required" });
  }

  const note = await MeetingNote.create({
    user: req.userId,
    title,
    meetingDate,
    meetingTime,
    meetingLink: meetingLink?.trim() ?? "",
    meetingType,
    notes,
  });

  res.status(201).json({ note });
}

export async function updateMeetingTime(req: AuthRequest, res: Response) {
  const { meetingTime } = req.body ?? {};
  if (typeof meetingTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(meetingTime)) {
    return res.status(400).json({ message: "meetingTime must be a valid HH:mm time" });
  }
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(400).json({ message: "Invalid meeting ID" });
  }
  const note = await MeetingNote.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: { meetingTime } },
    { new: true, runValidators: true }
  );
  if (!note) return res.status(404).json({ message: "Meeting not found" });
  res.json({ note });
}

export async function updateMeetingNote(req: AuthRequest, res: Response) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ message: "A meeting note object is required" });
  }

  const { title, meetingDate, meetingTime, meetingLink, meetingType, notes } = req.body;
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(400).json({ message: "Invalid meeting ID" });
  }
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "title is required" });
  }
  if (!isValidDate(meetingDate)) {
    return res.status(400).json({ message: "meetingDate must be a valid YYYY-MM-DD date" });
  }
  if (typeof meetingTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(meetingTime)) {
    return res.status(400).json({ message: "meetingTime must be a valid HH:mm time" });
  }
  if (meetingLink !== undefined && meetingLink !== "" && !isValidMeetingLink(meetingLink)) {
    return res.status(400).json({ message: "meetingLink must be a valid HTTP(S) URL" });
  }
  if (typeof meetingType !== "string" || !meetingType.trim()) {
    return res.status(400).json({ message: "meetingType is required" });
  }
  if (typeof notes !== "string" || !notes.trim()) {
    return res.status(400).json({ message: "notes are required" });
  }

  const note = await MeetingNote.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    {
      $set: {
        title: title.trim(),
        meetingDate,
        meetingTime,
        meetingLink: meetingLink?.trim() ?? "",
        meetingType: meetingType.trim(),
        notes: notes.trim(),
      },
    },
    { new: true, runValidators: true }
  );
  if (!note) return res.status(404).json({ message: "Meeting not found" });
  res.json({ note });
}

export async function deleteMeetingNote(req: AuthRequest, res: Response) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(400).json({ message: "Invalid meeting ID" });
  }

  const note = await MeetingNote.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!note) return res.status(404).json({ message: "Meeting not found" });
  res.status(204).send();
}
