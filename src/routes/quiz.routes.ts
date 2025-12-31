import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  deleteQuiz
} from "../controllers/quiz.controller";
import { requireRole } from "../middlewares/role.middleware";
import { Role } from "../models/User";

const router = Router();

router.post("/create", authenticate, requireRole([Role.LECTURER, Role.ADMIN]), createQuiz);
router.get("/me", authenticate, getMyQuizzes);
router.get("/:id", authenticate, getQuizById);
router.delete("/:id", authenticate, deleteQuiz);

export default router;
