import { Response } from "express";
import PomodoroSession from "../models/PomodoroSession";
import { AuthRequest } from "../middleware/auth";

export async function getSessions(req: AuthRequest, res: Response) {
  const sessions = await PomodoroSession.find({ user: req.userId })
    .sort({ startTime: -1 })
    .limit(100);
  res.json({ sessions });
}

export async function createSession(req: AuthRequest, res: Response) {
  const { task, startTime, durationMinutes, completed } = req.body;

  const session = await PomodoroSession.create({
    user: req.userId,
    task,
    startTime: startTime || new Date(),
    durationMinutes: durationMinutes || 25,
    completed: !!completed,
  });

  res.status(201).json({ session });
}

export async function getStats(req: AuthRequest, res: Response) {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const sessions = await PomodoroSession.find({
    user: req.userId,
    completed: true,
    startTime: { $gte: since },
  });

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  res.json({
    sessionsLast7Days: sessions.length,
    totalMinutesLast7Days: totalMinutes,
  });
}
