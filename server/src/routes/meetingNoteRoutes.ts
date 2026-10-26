import { Router } from "express";
import {
  createMeetingNote,
  deleteMeetingNote,
  getMeetingNotes,
  updateMeetingNote,
  updateMeetingTime,
} from "../controllers/meetingNoteController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getMeetingNotes);
router.post("/", createMeetingNote);
router.put("/:id", updateMeetingNote);
router.patch("/:id", updateMeetingTime);
router.delete("/:id", deleteMeetingNote);

export default router;
