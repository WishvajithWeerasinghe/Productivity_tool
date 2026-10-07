import { Router } from "express";
import { createMeetingNote, getMeetingNotes } from "../controllers/meetingNoteController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getMeetingNotes);
router.post("/", createMeetingNote);

export default router;
