import { Router } from "express";
import { createMeetingNote, getMeetingNotes, updateMeetingTime } from "../controllers/meetingNoteController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getMeetingNotes);
router.post("/", createMeetingNote);
router.patch("/:id", updateMeetingTime);

export default router;
