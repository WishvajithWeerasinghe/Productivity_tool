import { Router } from "express";
import { register, login, logout, me, updateProfile } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, updateProfile);

export default router;
