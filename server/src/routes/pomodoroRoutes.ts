import { Router } from "express";
import { getSessions, createSession, getStats } from "../controllers/pomodoroController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getSessions);
router.post("/", createSession);
router.get("/stats", getStats);

export default router;
