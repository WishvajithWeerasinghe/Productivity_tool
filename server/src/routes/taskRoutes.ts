import { Router } from "express";
import { getTasks, createTask, updateTask, deleteTask, reorderTasks } from "../controllers/taskController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getTasks);
router.post("/", createTask);
router.patch("/reorder", reorderTasks);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
