import { Router } from "express";
import { getEntries, createEntry, updateEntry, deleteEntry } from "../controllers/journalController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getEntries);
router.post("/", createEntry);
router.patch("/:id", updateEntry);
router.delete("/:id", deleteEntry);

export default router;
