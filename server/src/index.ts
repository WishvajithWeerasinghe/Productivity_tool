import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import { notFound, errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import pomodoroRoutes from "./routes/pomodoroRoutes";
import journalRoutes from "./routes/journalRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/journal", journalRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
