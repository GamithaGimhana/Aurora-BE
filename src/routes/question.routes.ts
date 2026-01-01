import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createQuestion,
  getMyQuestions,
  getQuestionById,
  deleteQuestion,
  getAllQuestions,
} from "../controllers/question.controller";
import { requireRole } from "../middlewares/role.middleware";
import { Role } from "../models/User";

const router = Router();

router.post("/create", authenticate, requireRole([Role.LECTURER, Role.ADMIN]), createQuestion);
router.get("/me", authenticate, getMyQuestions);
router.get("/:id", authenticate, getQuestionById);
router.delete("/:id", authenticate, deleteQuestion);
router.get("/", authenticate, getAllQuestions);

export default router;
